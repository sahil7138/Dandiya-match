export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"
import { EventSettingsForm } from "./_components/event-settings-form"
import { ChangePasswordModal } from "../_components/change-password-modal"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ShieldCheck, KeyRound } from "lucide-react"

export default async function EventSettingsPage() {
  let settings = null
  try {
    settings = await prisma.eventSettings.findFirst()
  } catch (err) {
    console.error("Failed to load event settings:", err)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">
          Event Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage global configuration and lifecycle for GENZ BLING NAVRATRI 2026.
        </p>
      </div>

      <EventSettingsForm settings={settings} />

      {/* Admin Account & Security Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Admin Account & Credentials</CardTitle>
                <CardDescription>
                  Manage organizer portal access, authentication, and security.
                </CardDescription>
              </div>
            </div>
            <ChangePasswordModal />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground">Active Admin Email</p>
              <p className="text-sm font-semibold font-mono text-foreground mt-1">
                rccindia@webworksstudios.com
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground">Access Role</p>
              <p className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                SUPER_ADMIN (Full Privileges)
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-4 w-4 text-primary shrink-0" />
              <span>Need to change or update your organizer password?</span>
            </div>
            <ChangePasswordModal />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
