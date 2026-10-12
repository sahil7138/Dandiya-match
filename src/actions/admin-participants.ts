"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createDatabaseBackup } from "@/lib/backup"

/**
 * Delete a single participant registration and associated records.
 */
export async function deleteParticipant(registrationId: string) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session required." }
  }

  if (!registrationId) {
    return { success: false, error: "Registration ID is required." }
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { user: true },
    })

    if (!registration) {
      return { success: false, error: "Participant entry not found." }
    }

    // Statutory safety & disaster recovery: take automatic snapshot before deletion
    try {
      await createDatabaseBackup()
    } catch (backupErr) {
      console.warn("Pre-deletion backup warning:", backupErr)
    }

    const userId = registration.userId

    await prisma.$transaction(async (tx) => {
      // 1. Clear any payment verifiedBy references to this user
      await tx.payment.updateMany({
        where: { verifiedById: userId },
        data: { verifiedById: null },
      })

      // 2. Delete matches involving this user
      await tx.match.deleteMany({
        where: {
          OR: [
            { participantAId: userId },
            { participantBId: userId },
          ],
        },
      })

      // 3. Delete payments associated with this registration
      await tx.payment.deleteMany({
        where: { registrationId: registration.id },
      })

      // 4. Delete match profile if any
      await tx.matchProfile.deleteMany({
        where: { userId },
      })

      // 5. Delete registration
      await tx.registration.delete({
        where: { id: registration.id },
      })

      // 6. Delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/payments")
    revalidatePath("/admin/matchmaking")
    revalidatePath("/admin/matches")
    revalidatePath("/admin/backup")
    revalidatePath("/admin")

    return {
      success: true,
      message: `Participant "${registration.user.name}" (${registration.gbnNumber}) has been deleted.`,
    }
  } catch (err: any) {
    console.error("Failed to delete participant:", err)
    return {
      success: false,
      error: err.message || "Failed to delete participant entry.",
    }
  }
}

/**
 * Bulk delete multiple participant entries.
 */
export async function bulkDeleteParticipants(registrationIds: string[]) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session required." }
  }

  if (!registrationIds || registrationIds.length === 0) {
    return { success: false, error: "No participant IDs provided." }
  }

  try {
    const registrations = await prisma.registration.findMany({
      where: { id: { in: registrationIds } },
      select: { id: true, userId: true },
    })

    if (registrations.length === 0) {
      return { success: false, error: "No matching participants found to delete." }
    }

    const validRegIds = registrations.map((r) => r.id)
    const validUserIds = registrations.map((r) => r.userId)

    // Statutory safety & disaster recovery: take automatic snapshot before bulk deletion
    try {
      await createDatabaseBackup()
    } catch (backupErr) {
      console.warn("Pre-bulk-deletion backup warning:", backupErr)
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clear any payment verifiedBy references
      await tx.payment.updateMany({
        where: { verifiedById: { in: validUserIds } },
        data: { verifiedById: null },
      })

      // 2. Delete matches involving any of these users
      await tx.match.deleteMany({
        where: {
          OR: [
            { participantAId: { in: validUserIds } },
            { participantBId: { in: validUserIds } },
          ],
        },
      })

      // 3. Delete payments associated with these registrations
      await tx.payment.deleteMany({
        where: { registrationId: { in: validRegIds } },
      })

      // 4. Delete match profiles
      await tx.matchProfile.deleteMany({
        where: { userId: { in: validUserIds } },
      })

      // 5. Delete registrations
      await tx.registration.deleteMany({
        where: { id: { in: validRegIds } },
      })

      // 6. Delete users
      await tx.user.deleteMany({
        where: { id: { in: validUserIds } },
      })
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/payments")
    revalidatePath("/admin/matchmaking")
    revalidatePath("/admin/matches")
    revalidatePath("/admin/backup")
    revalidatePath("/admin")

    return {
      success: true,
      count: validRegIds.length,
      message: `Successfully deleted ${validRegIds.length} participant entries.`,
    }
  } catch (err: any) {
    console.error("Failed to bulk delete participants:", err)
    return {
      success: false,
      error: err.message || "Failed to bulk delete participant entries.",
    }
  }
}
