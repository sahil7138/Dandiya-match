import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { listDatabaseBackups, createDatabaseBackup } from "@/lib/backup"
import { getDatabaseHealth } from "@/actions/admin-backup"
import { BackupClient } from "./_components/backup-client"

export const dynamic = "force-dynamic"

export default async function AdminBackupPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) redirect("/admin/login")

  let backups = await listDatabaseBackups()
  
  // If no backup exists, create an initial baseline snapshot
  if (backups.length === 0) {
    try {
      const initial = await createDatabaseBackup()
      backups = [initial]
    } catch (err) {
      console.error("Baseline backup failed:", err)
    }
  }

  const databaseHealth = await getDatabaseHealth()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">
          Database Backup & Auto-Sync
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time PostgreSQL database synchronization, automated snapshot rotation, and statutory data archives.
        </p>
      </div>

      <BackupClient
        initialBackups={backups}
        databaseHealth={databaseHealth}
      />
    </div>
  )
}
