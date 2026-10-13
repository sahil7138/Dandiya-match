"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { approvePayment, rejectPayment } from "@/actions/admin-payments"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Ticket, PhoneCall, CheckCircle2, Loader2, Sparkles } from "lucide-react"

export default function PaymentClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  
  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Approve Modal State (Pass No & Coordinator phone)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [approveGbn, setApproveGbn] = useState("")
  const [approveCoordinatorPhone, setApproveCoordinatorPhone] = useState("")

  // Screenshot Preview Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOpenApprove = (payment: any) => {
    setSelectedPayment(payment)
    setApproveGbn(payment.registration?.gbnNumber || "")
    setApproveCoordinatorPhone(payment.registration?.coordinatorPhone || "7709468117")
    setApproveModalOpen(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedPayment) return
    if (!approveGbn.trim()) {
      toast.error("Please enter or confirm the Pass Number (GBN).")
      return
    }
    if (!approveCoordinatorPhone.trim() || approveCoordinatorPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Coordinator contact number.")
      return
    }

    setIsProcessing(true)
    const res = await approvePayment(selectedPayment.id, {
      gbnNumber: approveGbn,
      coordinatorPhone: approveCoordinatorPhone,
    })
    setIsProcessing(false)

    if (res.success) {
      toast.success(`Pass ${approveGbn.toUpperCase()} verified and approved!`)
      setPayments((p) => p.filter((x) => x.id !== selectedPayment.id))
      setApproveModalOpen(false)
    } else {
      toast.error(res.error || "Failed to approve payment")
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
      setPayments((p) => p.filter((x) => x.id !== selectedPayment.id))
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
                <tr key={payment.id} className="bg-card hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {payment.registration.user.name}
                      {payment.registration.passType !== "SINGLE" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                          Lead
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      +91 {payment.registration.user.phone} • {payment.registration.gbnNumber}
                    </div>
                    {payment.registration.passType !== "SINGLE" && (
                      <div className="text-[11px] text-primary font-medium mt-0.5">
                        {payment.registration.passType === "COUPLE"
                          ? "+1 Partner (2 Passes)"
                          : payment.registration.passType === "GROUP"
                          ? "+3 Squad Members (4 Passes)"
                          : "+9 Gang Members (10 Passes)"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {payment.registration.passType}
                      {payment.registration.passType === "COUPLE" && " (×2)"}
                      {payment.registration.passType === "GROUP" && " (×4)"}
                      {payment.registration.passType === "GANG" && " (×10)"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment)
                        setImageModalOpen(true)
                      }}
                    >
                      View Receipt
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedPayment(payment)
                        setRejectModalOpen(true)
                      }}
                      disabled={isProcessing}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => handleOpenApprove(payment)}
                      disabled={isProcessing}
                    >
                      Approve &amp; Assign Pass
                    </Button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No pending payments. All registrations have been processed!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approval Modal with GBN Pass Number & Coordinator Phone */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Approve Pass &amp; Assign Collection Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm the physical pass number and designated coordinator for pass collection.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 py-2">
              {/* Attendee Details Summary */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendee:</span>
                  <span className="font-bold text-foreground">{selectedPayment.registration?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered Mobile:</span>
                  <span className="font-mono font-medium text-foreground">+91 {selectedPayment.registration?.user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pass Tier / Amount:</span>
                  <span className="font-bold text-primary">{selectedPayment.registration?.passType} • ₹{selectedPayment.amount}</span>
                </div>
              </div>

              {/* Input 1: Pass No (GBN) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-primary" /> Official Pass Number (GBN) *
                </Label>
                <Input
                  value={approveGbn}
                  onChange={(e) => setApproveGbn(e.target.value.toUpperCase())}
                  placeholder="e.g. GBN-0001"
                  className="font-mono text-sm uppercase tracking-wider font-bold"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Confirm or update the exact Pass Number printed on the physical wristband.
                </p>

                {/* Live Individual Passes Preview for Non-Single Passes */}
                {selectedPayment.registration?.passType !== "SINGLE" && approveGbn && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-primary" /> Member Passes to Issue:
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {selectedPayment.registration?.passType === "COUPLE"
                          ? "2 Passes"
                          : selectedPayment.registration?.passType === "GROUP"
                          ? "4 Passes"
                          : "10 Passes"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-card border border-primary/30 text-primary font-bold">
                        {approveGbn}-A (Lead)
                      </span>
                      {selectedPayment.registration?.passType === "COUPLE" && (
                        <span className="px-2 py-0.5 rounded bg-card border border-border text-foreground">
                          {approveGbn}-B ({selectedPayment.registration?.partnerName || "Partner"})
                        </span>
                      )}
                      {(selectedPayment.registration?.passType === "GROUP" ||
                        selectedPayment.registration?.passType === "GANG") && (
                        <>
                          {Array.from({
                            length: selectedPayment.registration?.passType === "GROUP" ? 3 : 9,
                          }).map((_, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-card border border-border text-foreground"
                            >
                              {approveGbn}-{String.fromCharCode(66 + i)} (Member {i + 2})
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Input 2: Coordinator Contact Number */}
              <div className="space-y-2">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> Coordinator Contact Number *
                </Label>
                <div className="flex">
                  <span className="h-10 px-3 flex items-center bg-muted border border-r-0 border-input rounded-l-md text-xs font-semibold text-muted-foreground">
                    +91
                  </span>
                  <Input
                    value={approveCoordinatorPhone}
                    onChange={(e) => setApproveCoordinatorPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="7709468117"
                    maxLength={10}
                    className="rounded-l-none font-mono text-sm font-bold"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This contact number will be displayed on the attendee&apos;s dashboard to contact for collecting the physical pass at the turf.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose render={<Button variant="outline" disabled={isProcessing} />}>
              Cancel
            </DialogClose>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleConfirmApprove}
              disabled={isProcessing || !approveGbn.trim() || !approveCoordinatorPhone.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                "Confirm & Issue Pass"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                onChange={(e) => setRejectReason(e.target.value)}
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
            <DialogTitle>Payment Receipt Screenshot</DialogTitle>
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
