import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ManageRevealModal } from "./manage-reveal-modal"

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: {
      participantA: true,
      participantB: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Matches</h1>
          <p className="text-muted-foreground mt-1">View all generated Dandiya pairs.</p>
        </div>
        <ManageRevealModal />
      </div>

      <Card className="border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, Match ID, or GBN..." className="max-w-sm" />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Match ID</th>
                <th className="px-6 py-4 font-semibold">Participant A</th>
                <th className="px-6 py-4 font-semibold">Participant B</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Reveal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matches.map((match) => (
                <tr key={match.id} className="bg-card hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{match.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{match.participantA.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{match.participantB.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={match.isLocked ? "default" : "outline"} className={match.isLocked ? "bg-amber-500 hover:bg-amber-600" : ""}>
                      {match.isLocked ? "LOCKED" : "PENDING"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={match.status === 'REVEALED' ? 'default' : 'secondary'} className={match.status === 'REVEALED' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {match.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <p className="mb-4">No matches have been generated yet.</p>
                      <Link href="/admin/matchmaking" className="text-primary hover:underline font-medium">
                        Go to Matchmaking Center
                      </Link>
                    </div>
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
