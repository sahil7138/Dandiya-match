"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Copy, Check, Users, ShieldCheck, Share2 } from "lucide-react"
import { toast } from "sonner"
import type { IndividualPass } from "@/lib/passes"

interface MemberPassesManifestProps {
  passes: IndividualPass[]
  passType: string
  bookingGbn: string
  leadName: string
  paymentStatus: string
  coordinatorPhone?: string | null
}

export function MemberPassesManifest({
  passes,
  passType,
  bookingGbn,
  leadName,
  paymentStatus,
  coordinatorPhone,
}: MemberPassesManifestProps) {
  const [copiedPass, setCopiedPass] = useState<string | null>(null)
  const [allCopied, setAllCopied] = useState(false)

  const copyPass = (passNumber: string, name: string) => {
    navigator.clipboard.writeText(passNumber)
    setCopiedPass(passNumber)
    toast.success(`Copied pass ${passNumber} for ${name}`)
    setTimeout(() => {
      setCopiedPass((prev) => (prev === passNumber ? null : prev))
    }, 2000)
  }

  const copyAllManifest = () => {
    const lines = [
      `🎟️ DANDIYA NIGHT PASS MANIFEST`,
      `Booking GBN: ${bookingGbn} (${passType})`,
      `Lead: ${leadName}`,
      `Coordinator: +91 ${coordinatorPhone || "Turf Helpdesk"}`,
      `---------------------------------`,
      ...passes.map(
        (p, idx) =>
          `${idx + 1}. ${p.name} (${p.role}): ${p.passNumber}`
      ),
      `---------------------------------`,
      `Show individual pass at entry gates.`,
    ]
    const text = lines.join("\n")
    navigator.clipboard.writeText(text)
    setAllCopied(true)
    toast.success("Full pass manifest copied to clipboard!")
    setTimeout(() => setAllCopied(false), 2500)
  }

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                Individual Member Passes
                <Badge variant="outline" className="text-xs font-semibold">
                  {passes.length} {passes.length === 1 ? "Pass" : "Passes"} Issued
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every member has a distinct entry pass. Share individual passes with attendees.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyAllManifest}
            className="gap-1.5 text-xs font-semibold border-primary/30 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
          >
            {allCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" /> All Passes Copied
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" /> Copy Full Manifest
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b font-mono">
              <tr>
                <th className="px-5 py-3 w-12 text-center">#</th>
                <th className="px-5 py-3">Pass Number</th>
                <th className="px-5 py-3">Attendee Name</th>
                <th className="px-5 py-3">Role / Tier</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Gate Verification</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {passes.map((pass, index) => {
                const isCopied = copiedPass === pass.passNumber
                return (
                  <tr
                    key={pass.passNumber}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center text-xs text-muted-foreground font-mono">
                      {index + 1}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary tracking-wide bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                          {pass.passNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPass(pass.passNumber, pass.name)}
                          title="Copy pass number"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        {pass.name}
                        {pass.isLead && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                            Lead
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs">
                        {pass.role}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {pass.phone ? `+91 ${pass.phone}` : "Via Booking Lead"}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          paymentStatus === "VERIFIED"
                            ? "default"
                            : paymentStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          paymentStatus === "VERIFIED"
                            ? "bg-green-600 text-white flex items-center gap-1 w-fit"
                            : "w-fit"
                        }
                      >
                        {paymentStatus === "VERIFIED" && (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        {paymentStatus === "VERIFIED"
                          ? "Wristband Ready"
                          : paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPass(pass.passNumber, pass.name)}
                        className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Pass
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
