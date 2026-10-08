"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { approvePayment, rejectPayment } from "../../actions/admin-payments"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function PaymentClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async (paymentId: string) => {
    setIsProcessing(true)
    const res = await approvePayment(paymentId)
    setIsProcessing(false)
    if (res.success) {
      toast.success("Payment approved successfully.")
      setPayments(p => p.filter(x => x.id !== paymentId))
    } else {
      toast.error(res.error)
    }
  }

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error("Reason is required.")
      return
    }
    setIsProcessing(true)
    const res = await rejectPayment(selectedPayment.id, rejectReason)
    setIsProcessing(false)
    if (res.success) {
      toast.success("Payment rejected.")
      setPayments(p => p.filter(x => x.id !== selectedPayment.id))
      setRejectModalOpen(false)
      setRejectReason("")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <>
      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Participant</th>
                <th className="px-6 py-4 font-semibold">Pass Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Screenshot</th>
                <th className="px-6 py-4 font-semibold">Submitted</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="bg-card hover:bg-muted/10">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{payment.registration.user.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{payment.registration.gbnNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{payment.registration.passType}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setImageModalOpen(true); }}>
                      View
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setSelectedPayment(payment); setRejectModalOpen(true); }} disabled={isProcessing}>
                      Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(payment.id)} disabled={isProcessing}>
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No pending payments. All caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for rejection</Label>
              <Textarea 
                placeholder="E.g. Invalid screenshot, incorrect amount..." 
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectReason}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4 bg-muted/20 rounded-md">
            {selectedPayment && (
              <img 
                src={selectedPayment.paymentScreenshotUrl} 
                alt="Payment Screenshot" 
                className="max-h-[60vh] object-contain rounded-md"
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button />}>
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
