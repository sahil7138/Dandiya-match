"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function approvePayment(
  paymentId: string,
  options?: {
    gbnNumber?: string
    coordinatorPhone?: string
  }
) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) return { success: false, error: "Unauthorized" }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: true }
    })
    
    if (!payment) return { success: false, error: "Payment not found" }

    // If custom GBN was provided, validate and check uniqueness if changed
    const targetGbn = options?.gbnNumber?.trim().toUpperCase() || payment.registration.gbnNumber
    if (targetGbn !== payment.registration.gbnNumber) {
      const existing = await prisma.registration.findUnique({
        where: { gbnNumber: targetGbn }
      })
      if (existing && existing.id !== payment.registrationId) {
        return { 
          success: false, 
          error: `Pass number ${targetGbn} is already assigned to another attendee. Please use a unique GBN number.` 
        }
      }
    }

    // Clean coordinator phone number
    const rawCoordinator = options?.coordinatorPhone?.trim()
    const cleanCoordinator = rawCoordinator ? rawCoordinator.replace(/\D/g, "").slice(-10) : null

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: "VERIFIED",
        verifiedAt: new Date()
      }
    })

    // Update group members with individual pass numbers if applicable
    let updatedGroupMembers = payment.registration.groupMembers
    if (payment.registration.groupMembers) {
      const LETTER_SUFFIXES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
      let members: any[] = []
      if (Array.isArray(payment.registration.groupMembers)) {
        members = payment.registration.groupMembers
      } else if (typeof payment.registration.groupMembers === "string") {
        try {
          members = JSON.parse(payment.registration.groupMembers)
        } catch {
          members = []
        }
      }
      if (members.length > 0) {
        updatedGroupMembers = members.map((m, idx) => ({
          ...(typeof m === "object" ? m : { name: m }),
          passNumber: `${targetGbn}-${LETTER_SUFFIXES[idx + 1] || idx + 2}`,
          memberIndex: idx + 2,
        }))
      }
    }

    // Update registration with confirmed Pass No (GBN) and Coordinator Phone
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { 
        paymentStatus: "VERIFIED",
        gbnNumber: targetGbn,
        groupMembers: updatedGroupMembers ?? undefined,
        coordinatorPhone: cleanCoordinator || payment.registration.coordinatorPhone || "7709468117"
      }
    })

    revalidatePath("/admin/payments")
    revalidatePath("/admin/participants")
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || "Failed to approve payment" }
  }
}

export async function rejectPayment(paymentId: string, reason: string) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) return { success: false, error: "Unauthorized" }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })
    
    if (!payment) return { success: false, error: "Payment not found" }

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", rejectionReason: reason }
    })

    // Update registration
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { paymentStatus: "REJECTED" }
    })

    revalidatePath("/admin/payments")
    revalidatePath("/admin/participants")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to reject payment" }
  }
}
