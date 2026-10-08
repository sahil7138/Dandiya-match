"use client"

import { useState } from "react"
import { updateRevealTime } from "@/app/actions/matchmaking"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CalendarClock, Loader2 } from "lucide-react"

export function ManageRevealModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const handleSave = async () => {
    if (!date || !time) {
      toast.error("Please select a date and time.")
      return
    }

    setIsSubmitting(true)
    try {
      const newTime = new Date(`${date}T${time}`)
      
      const res = await updateRevealTime(newTime)
      if (res.success) {
        toast.success("Reveal time updated successfully for all pending/locked matches.")
        setIsOpen(false)
      } else {
        toast.error(res.error || "Failed to update.")
      }
    } catch (error) {
      toast.error("An error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" />
        }
      >
        <CalendarClock className="w-4 h-4 mr-2" />
        Manage Reveal Time
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Match Reveal Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This will update the reveal time for all currently LOCKED or PENDING matches.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input 
              id="time" 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-primary to-[#ffb800]" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Reveal Time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
