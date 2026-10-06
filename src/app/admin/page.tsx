import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, CheckCircle, Clock, XCircle, Ticket, Heart, HeartOff, UserCheck, Dices, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) redirect("/admin/login")

  // Fetch counts in parallel
  const [
    totalRegistrations,
    verifiedPayments,
    pendingPayments,
    rejectedPayments,
    singlePasses,
    couplePasses,
    groupPasses,
    gangPasses,
    optIns,
    matchesCount
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.registration.count({ where: { paymentStatus: "PENDING" } }),
    prisma.registration.count({ where: { paymentStatus: "REJECTED" } }),
    prisma.registration.count({ where: { passType: "SINGLE" } }),
    prisma.registration.count({ where: { passType: "COUPLE" } }),
    prisma.registration.count({ where: { passType: "GROUP" } }),
    prisma.registration.count({ where: { passType: "GANG" } }),
    prisma.registration.count({ where: { matchmakingOptIn: true, paymentStatus: "VERIFIED" } }),
    prisma.match.count()
  ])

  const optOuts = singlePasses - optIns
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Event Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor registrations, payments and Dandiya matchmaking.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide text-foreground">REGISTRATION OPEN</span>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/payments"><Button variant="outline" size="sm">View Pending Payments</Button></Link>
        <Link href="/admin/matchmaking"><Button variant="outline" size="sm">View Match Pool</Button></Link>
        <Link href="/admin/matchmaking"><Button size="sm">Generate Matches</Button></Link>
        <Link href="/admin/matches"><Button variant="outline" size="sm">View Matches</Button></Link>
        <Link href="/admin/event"><Button variant="outline" size="sm">Event Settings</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Single Entries</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{singlePasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group/Couple/Gang Entries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couplePasses + groupPasses + gangPasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matchmaking Opt-ins</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optIns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matchmaking Opt-outs</CardTitle>
            <HeartOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optOuts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Generated</CardTitle>
            <Dices className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EVENT STATUS */}
        <Card className="col-span-1 overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">GENZ BLING NAVRATRI 2026</CardTitle>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p><strong>Event Date:</strong> 17 October 2026</p>
              <p><strong>Venue:</strong> The Grand Palace Grounds</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {['Registration', 'Payment Verification', 'Match Pool'].map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
                    <h3 className="font-bold">{step}</h3>
                    <p className="text-xs text-muted-foreground">Completed / Active</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MATCH REVEAL COUNTDOWN (Placeholder for now) */}
        <Card className="col-span-1 flex flex-col items-center justify-center text-center p-12 bg-primary/5 border-primary/20">
          <Dices className="h-16 w-16 text-primary mb-6 opacity-80" />
          <h3 className="text-2xl font-bold mb-2">No Matches Generated</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Once matches are generated and locked, the 24-hour countdown for the reveal will appear here.
          </p>
          <Link href="/admin/matchmaking">
            <Button size="lg">Go to Matchmaking Engine</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
