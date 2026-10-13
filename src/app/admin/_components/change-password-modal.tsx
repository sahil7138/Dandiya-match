"use client"

import { useState } from "react"
import { changeAdminPassword } from "@/actions/admin-auth"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react"

interface ChangePasswordModalProps {
  trigger?: React.ReactNode
  adminEmail?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChangePasswordModal({
  trigger,
  adminEmail = "rccindia@webworksstudios.com",
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ChangePasswordModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen
  const setIsOpen = isControlled ? externalOnOpenChange! : setInternalOpen

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrorMessage(null)
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!currentPassword.trim()) {
      const msg = "Please enter your current admin password."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (!newPassword.trim()) {
      const msg = "Please enter a new password."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (newPassword.trim().length < 8) {
      const msg = "New password must be at least 8 characters."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      const msg = "New password and confirmation password do not match."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (currentPassword.trim() === newPassword.trim()) {
      const msg = "New password must be different from current password."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    setIsLoading(true)
    try {
      const res = await changeAdminPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      })

      if (res.success) {
        toast.success(res.message || "Admin password updated successfully!")
        resetForm()
        setIsOpen(false)
      } else {
        const errorText = res.error || "Failed to update admin password."
        setErrorMessage(errorText)
        toast.error(errorText)
      }
    } catch {
      const errorText = "An unexpected error occurred while updating password."
      setErrorMessage(errorText)
      toast.error(errorText)
    } finally {
      setIsLoading(false)
    }
  }

  const isMinLength = newPassword.length >= 8
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen(val)
      if (!val) resetForm()
    }}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 cursor-pointer text-foreground hover:bg-primary/10 hover:border-primary/40"
          >
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            <span>Change Password</span>
          </Button>
        } />
      )}

      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-outfit text-foreground">
                Change Admin Password
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Account: <span className="font-mono font-semibold text-primary">{adminEmail}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Current Password
            </Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                required
                placeholder="Enter current admin password"
                className="h-10 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-primary" /> New Password
            </Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                required
                placeholder="Minimum 8 characters"
                className="h-10 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center gap-1 text-[11px]">
                {isMinLength ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
                <span className={isMinLength ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
                  At least 8 characters
                </span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Confirm New Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                required
                placeholder="Re-enter new password"
                className="h-10 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] pt-0.5">
                {isMatching ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-rose-400" />
                    <span className="text-rose-400">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setIsOpen(false)
              }}
              disabled={isLoading}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isMinLength || !isMatching}
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 cursor-pointer shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
