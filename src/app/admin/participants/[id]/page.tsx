import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const reg = await prisma.registration.findUnique({
    where: { id: resolvedParams.id },
    include: { user: true, payment: true }
  })

  if (!reg) return notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/admin/participants">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">{reg.user.name}</h1>
          <p className="text-muted-foreground mt-1">Registration ID: {reg.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{reg.user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{reg.user.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={reg.user.status === 'ACTIVE' ? 'default' : 'destructive'}>{reg.user.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">GBN Number</p>
              <p className="font-mono font-medium text-lg">{reg.gbnNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pass Type</p>
              <Badge variant="outline">{reg.passType}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered At</p>
              <p className="font-medium">{new Date(reg.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={reg.paymentStatus === 'VERIFIED' ? 'default' : reg.paymentStatus === 'REJECTED' ? 'destructive' : 'secondary'} className={reg.paymentStatus === 'VERIFIED' ? 'bg-green-500' : ''}>
                {reg.paymentStatus}
              </Badge>
            </div>
            {reg.payment && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">₹{reg.payment.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium">{new Date(reg.payment.createdAt).toLocaleString()}</p>
                </div>
                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="link" className="text-primary text-sm p-0 h-auto hover:underline" />
                      }
                    >
                      View Payment Screenshot
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-black border-zinc-800">
                      <div className="flex flex-col items-center">
                        <img 
                          src={reg.payment.paymentScreenshotUrl} 
                          alt="Payment Screenshot" 
                          className="max-w-full max-h-[80vh] object-contain rounded-md" 
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matchmaking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reg.passType !== 'SINGLE' ? (
              <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                Random Partner matchmaking is permanently unavailable for {reg.passType.toLowerCase()} registrations.
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Opt-In Status</p>
                <Badge variant="outline" className={reg.matchmakingOptIn ? 'border-primary text-primary' : ''}>
                  {reg.matchmakingOptIn ? 'OPTED IN' : 'OPTED OUT'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
