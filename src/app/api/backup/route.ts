import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createDatabaseBackup,
  listDatabaseBackups,
  getBackupContent,
  generateParticipantsCSV,
} from "@/lib/backup"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || "admin-backup-sync-secret-2026"

  const isAuthorized =
    !!isAdmin || (authHeader && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format")
  const file = searchParams.get("file")
  const download = searchParams.get("download")
  const action = searchParams.get("action")

  // Auto-sync or Cron trigger: create new snapshot
  if (action === "sync" || (authHeader && !format && !file && !download)) {
    try {
      const backup = await createDatabaseBackup()
      return NextResponse.json({
        success: true,
        message: "Automated database snapshot created and synced successfully.",
        backup,
      })
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // 1. Export CSV
  if (format === "csv") {
    try {
      const csv = await generateParticipantsCSV()
      const timestamp = new Date().toISOString().split("T")[0]
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="genz-bling-participants-${timestamp}.csv"`,
        },
      })
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // 2. Download specific backup file
  if (file) {
    const content = await getBackupContent(file)
    if (!content) {
      return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
    }
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    })
  }

  // 3. Download or create latest snapshot
  if (download === "latest") {
    try {
      const backups = await listDatabaseBackups()
      if (backups.length > 0) {
        const latestFile = backups[0].filename
        const content = await getBackupContent(latestFile)
        if (content) {
          return new NextResponse(content, {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": `attachment; filename="${latestFile}"`,
            },
          })
        }
      }

      // If no file exists yet, generate one on the fly
      const backup = await createDatabaseBackup()
      const content = await getBackupContent(backup.filename)
      return new NextResponse(content || "{}", {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${backup.filename}"`,
        },
      })
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // 4. Default: list backups
  const backups = await listDatabaseBackups()
  return NextResponse.json({ success: true, count: backups.length, backups })
}

/**
 * Trigger automated sync / snapshot via POST
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || "admin-backup-sync-secret-2026"

  const isAuthorized =
    !!isAdmin || (authHeader && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const backup = await createDatabaseBackup()
    return NextResponse.json({
      success: true,
      message: "Database snapshot synced successfully.",
      backup,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Backup failed" },
      { status: 500 }
    )
  }
}
