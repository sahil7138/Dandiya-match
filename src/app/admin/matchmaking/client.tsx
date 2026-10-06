"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { generateMatches } from "../../actions/matchmaking"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export default function MatchmakingClient({ eligibleCount }: { eligibleCount: number }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [open, setOpen] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    const res = await generateMatches()
    setIsGenerating(false)
    setOpen(false)
    
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Card className="p-6 border-border mt-6">
      <h3 className="text-xl font-bold font-outfit mb-4">Actions</h3>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button size="lg" className="w-full md:w-auto" disabled={eligibleCount < 2} />}>
          GENERATE RANDOM MATCHES
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Random Matches</DialogTitle>
            <DialogDescription>
              This will generate random matches for {Math.floor(eligibleCount / 2)} pairs from the {eligibleCount} eligible participants.
              Once generated, matches are immediately locked and set for reveal in 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm font-medium text-destructive">
            Warning: Once locked, matches cannot be easily changed. Do you want to proceed?
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
              Confirm & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {eligibleCount < 2 && (
        <p className="text-sm text-muted-foreground mt-2">Need at least 2 eligible participants to generate matches.</p>
      )}
    </Card>
  )
}
