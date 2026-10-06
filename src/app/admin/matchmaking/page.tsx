import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import MatchmakingClient from "./client"

export default async function MatchmakingAdminPage() {
  const eligible = await prisma.user.count({
    where: {
      status: "ACTIVE",
      registration: {
        passType: "SINGLE",
        paymentStatus: "VERIFIED",
        matchmakingOptIn: true
      }
    }
  })

  const excluded = await prisma.registration.count({
    where: {
      OR: [
        { passType: { in: ["COUPLE", "GROUP"] } },
        { matchmakingOptIn: false },
        { paymentStatus: { not: "VERIFIED" } }
      ]
    }
  })

  const rounds = await prisma.matchmakingRound.findMany({
    include: {
      _count: {
        select: { matches: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const matches = await prisma.match.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      participantA: true,
      participantB: true
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-outfit">Matchmaking Engine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border bg-card">
          <p className="text-sm text-muted-foreground">Eligible Participants</p>
          <p className="text-3xl font-bold text-primary">{eligible}</p>
          <p className="text-xs text-muted-foreground mt-2">Single, Payment Verified, Opted-in</p>
        </Card>
        <Card className="p-6 border-border bg-card">
          <p className="text-sm text-muted-foreground">Excluded Participants</p>
          <p className="text-3xl font-bold text-destructive">{excluded}</p>
          <p className="text-xs text-muted-foreground mt-2">Couples, Groups, Pending Payments, Opted-out</p>
        </Card>
      </div>

      <MatchmakingClient eligibleCount={eligible} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold font-outfit mb-4">Recent Match Rounds</h2>
        <Card className="border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-6 py-3">Round Name</th>
                <th className="px-6 py-3">Matches Generated</th>
                <th className="px-6 py-3">Reveal Time</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r.id} className="border-b bg-card">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4">{r._count.matches}</td>
                  <td className="px-6 py-4">{new Date(r.revealAt).toLocaleString()}</td>
                  <td className="px-6 py-4">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {rounds.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">No rounds generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold font-outfit mb-4">All Matches</h2>
        <Card className="border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-6 py-3">Participant A</th>
                <th className="px-6 py-3">Participant B</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Locked</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-b bg-card">
                  <td className="px-6 py-4">{m.participantA.name} ({m.participantA.phone})</td>
                  <td className="px-6 py-4">{m.participantB.name} ({m.participantB.phone})</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.status === 'REVEALED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{m.isLocked ? "🔒 Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
