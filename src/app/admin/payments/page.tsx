import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import PaymentClient from "./client"

export default async function PaymentsPage() {
  const pendingPayments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    include: { registration: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const verifiedCount = await prisma.payment.count({ where: { status: "VERIFIED" } })
  const rejectedCount = await prisma.payment.count({ where: { status: "REJECTED" } })
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify participant payments securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <PaymentClient initialPayments={pendingPayments} />
    </div>
  )
}
