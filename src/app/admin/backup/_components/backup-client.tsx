"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { triggerManualBackup } from "@/actions/admin-backup"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  HardDrive,
  Clock,
  FileJson,
  Hash,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import type { BackupSummary } from "@/lib/backup"

interface BackupClientProps {
  initialBackups: BackupSummary[]
  databaseHealth: {
    status: string
    latencyMs: number
    tables: {
      users: number
      registrations: number
      payments: number
      matches: number
    }
    lastChecked: string
  }
}

export function BackupClient({
  initialBackups,
  databaseHealth,
}: BackupClientProps) {
  const router = useRouter()
  const [backups, setBackups] = useState<BackupSummary[]>(initialBackups)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null)

  const handleCopyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum)
    setCopiedChecksum(checksum)
    toast.success("SHA-256 Checksum copied to clipboard!")
    setTimeout(() => setCopiedChecksum(null), 2000)
  }

  const handleCreateBackup = async () => {
    setIsGenerating(true)
    try {
      const res = await triggerManualBackup()
      if (res.success && res.backup) {
        toast.success(`Database snapshot ${res.backup.filename} created successfully!`)
        setBackups((prev) => [res.backup!, ...prev])
        router.refresh()
      } else {
        toast.error(res.error || "Failed to create backup.")
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.")
    } finally {
      setIsGenerating(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Live Sync Status & Quick Actions Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-outfit">
                    PostgreSQL Live Database Sync
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supabase PostgreSQL Cluster (Sydney AWS)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{databaseHealth.status === "HEALTHY" ? "LIVE & SYNCED" : "DEGRADED"}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-muted/40 border text-center">
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                  {databaseHealth.latencyMs} ms
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-center">
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="text-lg font-bold text-primary font-mono mt-0.5">
                  {databaseHealth.tables.registrations}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-center">
                <p className="text-xs text-muted-foreground">Payments</p>
                <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                  {databaseHealth.tables.payments}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border text-center">
                <p className="text-xs text-muted-foreground">Matches</p>
                <p className="text-lg font-bold text-pink-400 font-mono mt-0.5">
                  {databaseHealth.tables.matches}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={handleCreateBackup}
                disabled={isGenerating}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isGenerating ? "Capturing Snapshot..." : "Create Snapshot Now"}
              </Button>

              <a
                href="/api/backup?download=latest"
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
              >
                <FileJson className="h-4 w-4 text-primary" />
                Download Full JSON
              </a>

              <a
                href="/api/backup?format=csv"
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                Export CSV Manifest
              </a>
            </div>
          </CardContent>
        </Card>

        {/* DPDP Act 2023 Compliance Info */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle className="text-base font-bold">Statutory Compliance</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Digital Personal Data Protection Act, 2023 (DPDP Act)
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              • <strong>Section 8(5) Data Protection:</strong> All database snapshots are verified with SHA-256 cryptographic hashes to prevent tampering or unauthorized corruption.
            </p>
            <p>
              • <strong>Automated Sync & Pre-Deletion Archiving:</strong> An automated snapshot is immediately captured before any participant records are deleted, ensuring zero accidental data loss.
            </p>
            <p>
              • <strong>Data Minimization:</strong> Passwords, credentials, and sensitive tokens are strictly excluded from snapshot exports.
            </p>
            <p>
              • <strong>Retention & Rotation:</strong> Automated snapshot rotation safely manages storage by maintaining the 30 most recent archives.
            </p>
            <div className="pt-2 border-t flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1.5 text-[11px]">
                <CheckCircle className="h-3 w-3" />
                DPDP 2023 Compliant
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 text-[11px]">
                <HardDrive className="h-3 w-3" />
                Auto-Sync Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot Archive History */}
      <Card className="border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-outfit">
                Database Snapshot Archives
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saved system backups available for instant recovery and auditing.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Total Snapshots: {backups.length}
            </span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Snapshot File</th>
                <th className="px-6 py-4 font-semibold">Captured Date & Time</th>
                <th className="px-6 py-4 font-semibold">Record Counts</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">SHA-256 Checksum</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {backups.map((b) => (
                <tr key={b.id} className="bg-card hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {b.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(b.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-muted">
                        {b.recordCounts.registrations} Regs
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-muted">
                        {b.recordCounts.payments} Pays
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-muted">
                        {b.recordCounts.matches} Matches
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {formatBytes(b.fileSizeBytes)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleCopyChecksum(b.checksum)}
                      className="group flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/30 px-2 py-1 rounded border border-transparent hover:border-border"
                      title="Click to copy full SHA-256 hash"
                    >
                      {copiedChecksum === b.checksum ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      )}
                      <span>{b.checksum.substring(0, 14)}...</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/api/backup?file=${encodeURIComponent(b.filename)}`}
                      download={b.filename}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No backups captured yet. Click &quot;Create Snapshot Now&quot; above to capture your first database snapshot.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
