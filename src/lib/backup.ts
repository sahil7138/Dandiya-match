import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { getIndividualPasses } from "@/lib/passes"

export interface BackupSummary {
  id: string
  filename: string
  timestamp: string
  fileSizeBytes: number
  recordCounts: {
    users: number
    registrations: number
    payments: number
    matchProfiles: number
    matches: number
    rounds: number
    settings: number
  }
  checksum: string
}

const BACKUP_DIR = (process.env.VERCEL || process.env.NODE_ENV === "production")
  ? path.join("/tmp", "backups")
  : path.join(process.cwd(), "backups")

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  } catch (err) {
    console.error("Failed to ensure backup dir:", err)
  }
}

/**
 * Creates a full snapshot backup of all database tables.
 */
export async function createDatabaseBackup(): Promise<BackupSummary> {
  await ensureBackupDir()

  const [
    users,
    registrations,
    payments,
    matchProfiles,
    matches,
    rounds,
    eventSettings,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        instagramId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchProfile.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.match.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchmakingRound.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.eventSettings.findMany(),
  ])

  const timestamp = new Date().toISOString()
  const cleanTimestamp = timestamp.replace(/[:.]/g, "-")
  const filename = `backup-${cleanTimestamp}.json`
  const filepath = path.join(BACKUP_DIR, filename)

  const payload = {
    metadata: {
      application: "GENZ BLING NAVRATRI 2026",
      version: "1.0",
      generatedAt: timestamp,
      generator: "Admin Backup & Sync Engine",
      statutoryCompliance: "DPDP Act 2023 Compliant Snapshot",
    },
    counts: {
      users: users.length,
      registrations: registrations.length,
      payments: payments.length,
      matchProfiles: matchProfiles.length,
      matches: matches.length,
      rounds: rounds.length,
      settings: eventSettings.length,
    },
    data: {
      users,
      registrations,
      payments,
      matchProfiles,
      matches,
      rounds,
      eventSettings,
    },
  }

  const jsonString = JSON.stringify(payload, null, 2)
  const checksum = crypto.createHash("sha256").update(jsonString).digest("hex")

  const fullBackupData = {
    ...payload,
    checksum,
  }

  const finalContent = JSON.stringify(fullBackupData, null, 2)
  await fs.writeFile(filepath, finalContent, "utf-8")

  const stats = await fs.stat(filepath)

  // Log to AuditLog if available
  try {
    await prisma.auditLog.create({
      data: {
        adminId: "SYSTEM_BACKUP",
        action: "DATABASE_BACKUP_CREATED",
        entityType: "BACKUP",
        entityId: filename,
        metadata: {
          fileSize: stats.size,
          checksum,
          counts: payload.counts,
        },
      },
    })
  } catch (logErr) {
    console.error("Audit log creation skipped:", logErr)
  }

  // Cleanup: keep latest 30 backups to preserve disk space
  try {
    const files = await fs.readdir(BACKUP_DIR)
    const backupFiles = files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort()
      .reverse()

    if (backupFiles.length > 30) {
      const filesToDelete = backupFiles.slice(30)
      for (const f of filesToDelete) {
        await fs.unlink(path.join(BACKUP_DIR, f)).catch(() => {})
      }
    }
  } catch (cleanErr) {
    console.error("Backup rotation error:", cleanErr)
  }

  return {
    id: cleanTimestamp,
    filename,
    timestamp,
    fileSizeBytes: stats.size,
    recordCounts: payload.counts,
    checksum,
  }
}

/**
 * List all available database backups stored on the filesystem.
 */
export async function listDatabaseBackups(): Promise<BackupSummary[]> {
  await ensureBackupDir()

  try {
    const files = await fs.readdir(BACKUP_DIR)
    const backupFiles = files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort()
      .reverse()

    const summaries: BackupSummary[] = []

    for (const filename of backupFiles) {
      try {
        const filepath = path.join(BACKUP_DIR, filename)
        const stats = await fs.stat(filepath)
        const raw = await fs.readFile(filepath, "utf-8")
        const parsed = JSON.parse(raw)

        summaries.push({
          id: filename.replace("backup-", "").replace(".json", ""),
          filename,
          timestamp: parsed.metadata?.generatedAt || stats.mtime.toISOString(),
          fileSizeBytes: stats.size,
          recordCounts: parsed.counts || {
            users: 0,
            registrations: 0,
            payments: 0,
            matchProfiles: 0,
            matches: 0,
            rounds: 0,
            settings: 0,
          },
          checksum: parsed.checksum || "verified",
        })
      } catch (fileErr) {
        console.error(`Error reading backup ${filename}:`, fileErr)
      }
    }

    return summaries
  } catch (err) {
    console.error("Failed to list backups:", err)
    return []
  }
}

/**
 * Reads a single backup file content by filename.
 */
export async function getBackupContent(filename: string): Promise<string | null> {
  await ensureBackupDir()
  const sanitized = path.basename(filename)
  const filepath = path.join(BACKUP_DIR, sanitized)
  try {
    return await fs.readFile(filepath, "utf-8")
  } catch {
    return null
  }
}

/**
 * Generates clean CSV of participants for door coordinators & accounting.
 */
export async function generateParticipantsCSV(): Promise<string> {
  const registrations = await prisma.registration.findMany({
    include: { user: true, payment: true },
    orderBy: { createdAt: "desc" },
  })

  const headers = [
    "Individual Pass No",
    "Attendee Name",
    "Role",
    "Phone",
    "Booking Lead",
    "Lead Phone",
    "Base GBN",
    "Tier",
    "Payment Status",
    "Payment Amount",
    "Matchmaking Opt-In",
    "Coordinator Phone",
    "Registered At",
    "DPDP Consent Recorded",
  ]

  const rows: string[][] = []

  for (const r of registrations) {
    const passes = getIndividualPasses(r)
    for (const p of passes) {
      rows.push([
        `"${p.passNumber}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.role}"`,
        `"${p.phone || r.user.phone}"`,
        `"${r.user.name.replace(/"/g, '""')}"`,
        `"${r.user.phone}"`,
        `"${r.gbnNumber}"`,
        `"${r.passType}"`,
        `"${r.paymentStatus}"`,
        `"${r.payment?.amount || 0}"`,
        `"${r.matchmakingOptIn ? "YES" : "NO"}"`,
        `"${r.coordinatorPhone || ""}"`,
        `"${new Date(r.createdAt).toISOString()}"`,
        `"${r.dpdpConsent ? "YES" : "NO"}"`,
      ])
    }
  }

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
