"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createDatabaseBackup, listDatabaseBackups, type BackupSummary } from "@/lib/backup"

export async function triggerManualBackup(): Promise<{
  success: boolean
  backup?: BackupSummary
  error?: string
}> {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session required." }
  }

  try {
    const backup = await createDatabaseBackup()
    revalidatePath("/admin/backup")
    revalidatePath("/admin")
    return { success: true, backup }
  } catch (err: any) {
    console.error("Backup generation failed:", err)
    return { success: false, error: err?.message || "Failed to create database backup." }
  }
}

export async function getBackupsList(): Promise<{
  success: boolean
  backups: BackupSummary[]
  error?: string
}> {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) {
    return { success: false, backups: [], error: "Unauthorized: Admin session required." }
  }

  try {
    const backups = await listDatabaseBackups()
    return { success: true, backups }
  } catch (err: any) {
    console.error("Failed to list backups:", err)
    return { success: false, backups: [], error: err?.message || "Failed to retrieve backups list." }
  }
}

export async function getDatabaseHealth() {
  const startTime = Date.now()
  try {
    const [userCount, regCount, paymentCount, matchCount] = await Promise.all([
      prisma.user.count(),
      prisma.registration.count(),
      prisma.payment.count(),
      prisma.match.count(),
    ])
    const latencyMs = Date.now() - startTime

    return {
      status: "HEALTHY",
      latencyMs,
      tables: {
        users: userCount,
        registrations: regCount,
        payments: paymentCount,
        matches: matchCount,
      },
      lastChecked: new Date().toISOString(),
    }
  } catch (err: any) {
    return {
      status: "DEGRADED",
      latencyMs: Date.now() - startTime,
      tables: { users: 0, registrations: 0, payments: 0, matches: 0 },
      lastChecked: new Date().toISOString(),
      error: err?.message,
    }
  }
}
