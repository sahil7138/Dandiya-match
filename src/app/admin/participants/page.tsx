export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma"
import { ParticipantsTable } from "./_components/participants-table"
import type { ParticipantListItem } from "@/types"

export default async function ParticipantsPage() {
  let registrations: ParticipantListItem[] = []

  try {
    registrations = (await prisma.registration.findMany({
      include: { user: true, payment: true },
      orderBy: { createdAt: "desc" },
    })) as unknown as ParticipantListItem[]
  } catch (err) {
    console.error("Failed to load participants:", err)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">
            Participants Registry
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage attendee registrations, pass verification, and matchmaking eligibility.
          </p>
        </div>
      </div>

      <ParticipantsTable registrations={registrations} />
    </div>
  )
}
