"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteParticipant } from "@/actions/admin-participants"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteParticipantButtonProps {
  registrationId: string
  participantName: string
  gbnNumber: string
  redirectAfterDelete?: boolean
}

export function DeleteParticipantButton({
  registrationId,
  participantName,
  gbnNumber,
  redirectAfterDelete = false,
}: DeleteParticipantButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteParticipant(registrationId)
      if (res.success) {
        toast.success(res.message || "Participant entry deleted successfully.")
        setIsOpen(false)
        if (redirectAfterDelete) {
          router.push("/admin/participants")
        } else {
          router.refresh()
        }
      } else {
        toast.error(res.error || "Failed to delete participant entry.")
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="gap-1.5 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete Entry
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Delete Participant Entry</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Permanent removal of attendee records
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 border text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participant:</span>
                <span className="font-semibold text-foreground">{participantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GBN Pass:</span>
                <span className="font-mono font-bold text-primary">{gbnNumber}</span>
              </div>
            </div>

            <p className="text-xs text-red-400/90 leading-relaxed">
              ⚠️ Warning: This will permanently delete this participant&apos;s registration, payment verification, and matchmaking allocations. This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
