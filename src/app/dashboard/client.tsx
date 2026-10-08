"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { logoutUser } from "../actions/auth"
import { 
  LogOut, Ticket, CreditCard, Lock, Sparkles, Clock, CheckCircle2, 
  Loader2, CalendarDays, MapPin, Phone, MessageSquare, User, ShieldCheck, Heart
} from "lucide-react"
import Link from "next/link"

export default function DashboardClient({ data }: { data: any }) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" })
  const [isRevealed, setIsRevealed] = useState(data.match?.status === "REVEALED")

  useEffect(() => {
    if (!data.match || isRevealed) return

    const revealTime = new Date(data.match.revealAt).getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = revealTime - now

      if (diff <= 0) {
        clearInterval(timer)
        setIsRevealed(true)
        window.location.reload()
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0")
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0")
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0")
        setTimeLeft({ h, m, s })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [data.match, isRevealed])

  const paymentBadgeStyles: Record<string, { bg: string; text: string; label: string }> = {
    VERIFIED: { bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400", text: "text-emerald-400", label: "Payment Verified ✓" },
    PENDING: { bg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400", text: "text-yellow-400", label: "Verification Pending ⏳" },
    REJECTED: { bg: "bg-red-500/15 border-red-500/30 text-red-400", text: "text-red-400", label: "Payment Declined ✕" },
  }

  const pStatus = paymentBadgeStyles[data.registration.paymentStatus] || paymentBadgeStyles.PENDING

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 flex flex-col items-center bg-[#09080e] text-white">
      {/* Glow ambient background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-primary/10 via-[#8b5cf6]/10 to-[#ffb800]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 glass-card rounded-2xl px-5 py-3 border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 border border-white/10 p-0.5 shadow-md shadow-primary/20">
            <img
              src="/logo.png"
              alt="GENZ BLING NAVRATRI 2026"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold font-outfit text-base text-white tracking-tight">GENZ BLING</span>
            <span className="text-[10px] text-zinc-400 block -mt-1 font-mono">DASHBOARD</span>
          </div>
        </Link>

        <form action={logoutUser}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5 text-primary" /> Logout
          </Button>
        </form>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <span className="text-xs font-bold text-[#ffb800] tracking-widest uppercase font-mono">
            OFFICIAL FESTIVAL PASS
          </span>
          <h1 className="text-3xl font-black font-outfit text-white">
            Hey, {data.user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Welcome to your attendee control room for 17th October 2026.
          </p>
        </motion.div>

        {/* Digital Holographic Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2rem] p-6 sm:p-8 border border-primary/30 shadow-[0_0_50px_rgba(255,42,122,0.15)] relative overflow-hidden"
        >
          {/* Top Pass Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                PASS NUMBER (GBN)
              </span>
              <span className="text-2xl font-black font-mono tracking-wider text-[#ffb800]">
                {data.registration.gbnNumber}
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${pStatus.bg}`}>
              {pStatus.label}
            </div>
          </div>

          {/* Pass Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                <Ticket className="w-3 h-3 text-primary" /> Pass Tier
              </span>
              <p className="font-bold text-sm text-white mt-0.5">{data.registration.passType}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-[#ffb800]" /> Event Date
              </span>
              <p className="font-bold text-sm text-white mt-0.5">17 Oct 2026</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> Venue
              </span>
              <p className="font-bold text-xs text-white mt-0.5 truncate">Noupark Turf, Narhe</p>
            </div>
          </div>

          {/* Barcode graphic effect */}
          <div className="pt-2 flex flex-col items-center">
            <div className="w-full h-8 bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,transparent_2px,transparent_6px,#fff_6px,#fff_9px,transparent_9px,transparent_12px)] opacity-30 rounded mb-1" />
            <span className="text-[9px] font-mono text-zinc-500 tracking-[0.3em] uppercase">
              SHOW THIS PASS AT GATES ON ENTRY
            </span>
          </div>
        </motion.div>

        {/* Partner & Matchmaking Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {data.registration.paymentStatus === "REJECTED" ? (
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-red-500/30 text-center space-y-3">
              <span className="text-4xl block mb-2">❌</span>
              <h3 className="text-2xl font-black font-outfit text-white">Payment Declined</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                Your payment screenshot could not be verified.
              </p>
              {data.registration.rejectionReason && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <strong>Reason:</strong> {data.registration.rejectionReason}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* COUPLE PASS */}
          {data.registration.passType === "COUPLE" && (
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/10 text-center space-y-3">
              <span className="text-3xl block">💃🕺</span>
              <h3 className="text-2xl font-black font-outfit text-white">Dynamic Duo Pass</h3>
              <p className="text-sm text-zinc-300">
                Registered Partner: <strong className="text-white text-base font-bold">{data.registration.partnerName || "Partner"}</strong>
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Couple passes enter together directly at the entrance. Random Dandiya partner matching is not applicable for Duo passes.
              </p>
            </div>
          )}

          {/* GROUP PASS */}
          {(data.registration.passType === "GROUP" || data.registration.passType === "GANG") && (
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/10 text-center space-y-4">
              <span className="text-3xl block">⚡</span>
              <h3 className="text-2xl font-black font-outfit text-white">
                {data.registration.passType === "GROUP" ? "The Bling Squad (4 Members)" : "The Bling Gang (10 Members)"}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold">
                  {data.user.name} (Lead)
                </span>
                {data.registration.groupMembers?.map((m: any, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                    {m.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                Your group will enter together through the fast-track group lane!
              </p>
            </div>
          )}

          {/* SINGLE PASS - NOT OPTED IN */}
          {data.registration.passType === "SINGLE" && !data.registration.matchmakingOptIn && (
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/10 text-center space-y-3">
              <span className="text-3xl block">🕺</span>
              <h3 className="text-2xl font-black font-outfit text-white">Solo Dancer Pass</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                You are registered as an independent solo participant. You did not opt into the secret Dandiya matchmaking pool. Enjoy the dance floor and live DJ!
              </p>
            </div>
          )}

          {/* SINGLE PASS - OPTED IN */}
          {data.registration.passType === "SINGLE" && data.registration.matchmakingOptIn && (
            <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-primary/30 shadow-[0_0_40px_rgba(255,42,122,0.15)] text-center relative overflow-hidden">
              
              {/* STATE 1: Match not generated yet */}
              {!data.match ? (
                <div className="py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black font-outfit text-white">
                    Matching In Progress 🎲
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                    You are in the secret Dandiya matchmaking pool! The algorithm is compiling participant vibes.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" /> Stay tuned for the secret reveal!
                  </div>
                </div>
              ) : !isRevealed ? (
                /* STATE 2: Match exists but locked (24-hour countdown) */
                <div className="py-4 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-black/60 rounded-full border-2 border-primary/50 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,42,122,0.3)]">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#ffb800] uppercase font-mono block mb-1">
                      CONFIDENTIAL PARTNER
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                      Match Secretly Locked
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mt-1">
                      Your random Dandiya partner has been assigned by the algorithm.
                    </p>
                  </div>

                  {/* 24-Hour Countdown Box */}
                  <div className="bg-black/50 rounded-2xl p-5 border border-white/10 max-w-sm mx-auto">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-primary" /> REVEALING IN
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-2xl font-black font-mono text-primary block">{timeLeft.h}</span>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold">HOURS</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-2xl font-black font-mono text-[#ffb800] block">{timeLeft.m}</span>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold">MINUTES</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-2xl font-black font-mono text-white block">{timeLeft.s}</span>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold">SECONDS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STATE 3: Revealed! */
                <div className="py-4 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-[#8b5cf6] to-[#ffb800] p-1 mx-auto shadow-[0_0_40px_rgba(255,42,122,0.4)]">
                    <div className="w-full h-full bg-[#120f1e] rounded-full flex items-center justify-center text-3xl">
                      💃
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono block mb-1">
                      24-HOUR COUNTDOWN COMPLETE
                    </span>
                    <h3 className="text-3xl font-black font-outfit text-white">
                      🎉 It&apos;s A Dandiya Match!
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Meet your dance partner for the night at Noupark Turf!
                    </p>
                  </div>

                  <div className="bg-black/50 p-6 rounded-2xl border border-primary/20 text-left space-y-4 max-w-md mx-auto">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase">Partner Name</span>
                        <h4 className="text-xl font-bold font-outfit text-white">
                          {data.match.partner.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                        {data.match.partner.gender}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <span className="text-zinc-400 block text-[10px]">Age Group</span>
                        <span className="font-semibold text-white">{data.match.partner.ageGroup}</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <span className="text-zinc-400 block text-[10px]">Dance Experience</span>
                        <span className="font-semibold text-white">{data.match.partner.experience}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl text-xs">
                      <span className="text-zinc-400 block text-[10px]">Festival Vibe</span>
                      <span className="font-semibold text-[#ffb800]">✨ {data.match.partner.vibe}</span>
                    </div>

                    <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Ready to Groove!
                    </Button>
                    <p className="text-[10px] text-zinc-500 text-center">
                      Spot each other on the turf dance floor at 7:00 PM!
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
            </div>
          )}
        </motion.div>

        {/* Quick Enquiries Card */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <p className="font-bold text-white">Need help with your pass or venue entry?</p>
            <p className="text-[11px]">Call our organizers at +91 7709468117 or +91 8080206737</p>
          </div>
          <a
            href="https://wa.me/917709468117?text=Hi%20Organizer,%20I%20have%20an%20enquiry%20regarding%20my%20pass"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/5">
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" /> WhatsApp Support
            </Button>
          </a>
        </div>

      </div>
    </div>
  )
}
