import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function ParticipantsPage() {
  const registrations = await prisma.registration.findMany({
    include: { user: true, payment: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Participants</h1>
          <p className="text-muted-foreground mt-1">Manage all event registrations and eligibility.</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or GBN..." className="max-w-sm" />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Participant</th>
                <th className="px-6 py-4 font-semibold">GBN</th>
                <th className="px-6 py-4 font-semibold">Pass Type</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Matchmaking</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.map((reg) => (
                <tr key={reg.id} className="bg-card hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{reg.user.name}</div>
                    <div className="text-xs text-muted-foreground">{reg.user.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{reg.gbnNumber}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{reg.passType}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={reg.paymentStatus === 'VERIFIED' ? 'default' : reg.paymentStatus === 'REJECTED' ? 'destructive' : 'secondary'} className={reg.paymentStatus === 'VERIFIED' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {reg.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {reg.passType === 'SINGLE' ? (
                      <Badge variant="outline" className={reg.matchmakingOptIn ? 'border-primary text-primary' : ''}>
                        {reg.matchmakingOptIn ? 'OPTED IN' : 'OPTED OUT'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not Eligible</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/participants/${reg.id}`} className="text-primary hover:underline text-sm font-medium">View Detail</Link>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No participants found.
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
