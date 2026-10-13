"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Sparkles, Copy, Check, ArrowRight, Ticket, Phone } from "lucide-react"
import { toast } from "sonner"
import { PassTypeEnum } from "@prisma/client"

interface RegistrationSuccessProps {
  passType: PassTypeEnum
  amount: number
  gbnNumber?: string
  phone?: string
  matchmakingOptIn: boolean
  passName: string
}

export function RegistrationSuccess({
  amount,
  phone,
  matchmakingOptIn,
  passName,
}: RegistrationSuccessProps) {
  const loginUrl = "/dashboard"

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg glass-card rounded-[2.5rem] p-8 md:p-10 border border-primary/40 shadow-[0_0_60px_rgba(255,42,122,0.25)] text-center relative overflow-hidden"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/20 blur-3xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-400 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> PAYMENT SUBMITTED • UNDER VERIFICATION
        </div>

        <h2 className="text-3xl font-black font-outfit text-white mb-2">
          Registration Received! 🎉
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Your booking for <strong className="text-white">GENZ BLING NAVRATRI 2026</strong> has been received and your payment screenshot is queued for organizer verification.
        </p>

        {/* Verification Notice Box (Pass is NOT given until payment verified) */}
        <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shadow-lg text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-yellow-400 font-mono">
            <Ticket className="w-3.5 h-3.5 text-yellow-400" /> Pass Issuance Notice
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your official Pass Number (GBN) will be issued as soon as organizers verify your payment screenshot.
          </p>
          <div className="pt-1 text-[11px] text-zinc-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-primary shrink-0" />
            <span>You can log in to your dashboard anytime using registered mobile <strong className="text-white font-mono">+91 {phone}</strong>.</span>
          </div>
        </div>

        {/* Booking Details Summary */}
        <div className="bg-black/50 p-5 rounded-2xl border border-white/10 mb-6 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Pass Tier:</span>
            <span className="font-bold text-white">{passName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Amount Paid:</span>
            <span className="font-bold text-[#ffb800]">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Verification Status:</span>
            <span className="font-bold text-yellow-400">Pending Admin Review</span>
          </div>
          {matchmakingOptIn && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-primary font-semibold">
              <span>🎲 Secret Dandiya Match Pool:</span>
              <span className="text-emerald-400 font-bold">Enrolled!</span>
            </div>
          )}
        </div>

        {/* Action Button to Dashboard */}
        <Link href={loginUrl} className="w-full block">
          <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-95 transition-all">
            View Personal Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
