export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"
import { EventSettingsForm } from "./_components/event-settings-form"

export default async function EventSettingsPage() {
  const settings = await prisma.eventSettings.findFirst()

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
    </div>
  )
}
