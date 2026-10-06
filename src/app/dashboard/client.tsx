"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { logoutUser } from "../actions/auth"
import { LogOut, Ticket, CreditCard, Lock, Sparkles, Clock, CheckCircle2, Loader2 } from "lucide-react"

export default function DashboardClient({ data }: { data: any }) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" })
  const [isRevealed, setIsRevealed] = useState(data.match?.status === "REVEALED")

  useEffect(() => {
    if (!data.match || isRevealed) return;

    const revealTime = new Date(data.match.revealAt).getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = revealTime - now
      
      if (diff <= 0) {
        clearInterval(timer)
        setIsRevealed(true)
        // Optionally refresh page or show reveal if server changes it, but we can't show data unless server provides it.
        // For real-time, we would need to reload or poll the server.
        window.location.reload()
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60))).toString().padStart(2, "0")
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0")
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0")
        setTimeLeft({ h, m, s })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [data.match, isRevealed])

  const paymentColors = {
    PENDING: "text-yellow-500 bg-yellow-500/10",
    VERIFIED: "text-green-500 bg-green-500/10",
    REJECTED: "text-red-500 bg-red-500/10",
  }

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-outfit text-primary">DANDIYA MATCH</h1>
        <Button variant="ghost" size="sm" onClick={() => logoutUser()} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold font-outfit">Hey, {data.user.name} 👋</h2>
          <p className="text-muted-foreground">Ready for the night?</p>
        </motion.div>

        {/* Pass Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 border-border shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Ticket className="w-4 h-4" /> Pass Type</p>
                <p className="font-bold">{data.registration.passType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass No (GBN)</p>
                <p className="font-mono font-bold uppercase">{data.registration.gbnNumber}</p>
              </div>
              <div className="col-span-2 mt-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1"><CreditCard className="w-4 h-4" /> Payment Status</p>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${paymentColors[data.registration.paymentStatus as keyof typeof paymentColors]}`}>
                  {data.registration.paymentStatus}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Partner / Matchmaking Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          
          {data.registration.passType === "COUPLE" && (
            <Card className="p-6 border-primary/20 bg-secondary/10 shadow-sm text-center">
              <h3 className="text-2xl mb-2">💃 DYNAMIC DUO</h3>
              <p className="text-muted-foreground mb-4">Partner: <span className="font-bold text-foreground">{data.registration.partnerName}</span></p>
              <div className="text-sm text-secondary-foreground">
                You're already registered with your partner. Random Dandiya matchmaking is unavailable for Couple Entry.
              </div>
            </Card>
          )}

          {data.registration.passType === "GROUP" && (
            <Card className="p-6 border-primary/20 bg-secondary/10 shadow-sm text-center">
              <h3 className="text-2xl mb-2">🕺 THE WHOLE SQUAD</h3>
              <div className="flex flex-col gap-1 mb-4">
                {data.registration.groupMembers?.map((m: any, i: number) => (
                  <span key={i} className="font-bold text-foreground">{m.name}</span>
                ))}
              </div>
              <div className="text-sm text-secondary-foreground">
                Group entries are not eligible for Random Dandiya Partner matching.
              </div>
            </Card>
          )}

          {data.registration.passType === "SINGLE" && !data.registration.matchmakingOptIn && (
            <Card className="p-6 border-border shadow-sm text-center">
              <h3 className="text-2xl mb-2">🕺 SOLO DANCER</h3>
              <div className="text-sm text-muted-foreground">
                You're registered as a solo participant. You chose not to enter the random Dandiya partner pool.
              </div>
            </Card>
          )}

          {data.registration.passType === "SINGLE" && data.registration.matchmakingOptIn && (
            <Card className={`p-8 border-2 shadow-sm text-center relative overflow-hidden ${isRevealed ? 'border-primary bg-primary/5' : 'border-border'}`}>
              
              {!data.match ? (
                <div>
                  <h3 className="text-2xl font-bold text-primary font-outfit mb-2">YOUR DANDIYA MATCH 🎲</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Matching in progress
                  </div>
                  <p className="text-sm mt-4 text-muted-foreground">The admin will generate matches soon. Stay tuned!</p>
                </div>
              ) : !isRevealed ? (
                <div>
                  <h3 className="text-2xl font-bold text-primary font-outfit mb-2">YOUR DANDIYA MATCH 🎲</h3>
                  
                  <div className="mt-8 mb-6 relative">
                    <div className="w-24 h-24 bg-card rounded-full border-4 border-border mx-auto flex items-center justify-center shadow-inner z-10 relative">
                      <Lock className="w-10 h-10 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="text-xl font-bold mb-1 tracking-wider text-muted-foreground">MATCH LOCKED</div>
                  <p className="text-sm text-muted-foreground mb-8">Your random Dandiya partner has been selected.</p>
                  
                  <div className="bg-background rounded-xl p-4 border shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> REVEALING IN
                    </div>
                    <div className="flex items-center justify-center gap-4 text-3xl font-bold font-mono">
                      <div className="flex flex-col"><span className="text-primary">{timeLeft.h}</span><span className="text-[10px] text-muted-foreground font-sans uppercase">HRS</span></div>
                      <span className="text-muted-foreground mb-4">:</span>
                      <div className="flex flex-col"><span className="text-primary">{timeLeft.m}</span><span className="text-[10px] text-muted-foreground font-sans uppercase">MIN</span></div>
                      <span className="text-muted-foreground mb-4">:</span>
                      <div className="flex flex-col"><span className="text-primary">{timeLeft.s}</span><span className="text-[10px] text-muted-foreground font-sans uppercase">SEC</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg')] bg-cover bg-center opacity-10 blur-xl"></div>
                  
                  <h3 className="text-3xl font-bold text-primary font-outfit mb-2">🎉 IT'S A MATCH!</h3>
                  <p className="text-sm text-muted-foreground mb-8">Your Dandiya partner has been revealed.</p>
                  
                  <div className="bg-card p-6 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(193,18,31,0.15)] relative z-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full border border-primary mx-auto flex items-center justify-center text-4xl mb-4">
                      👤
                    </div>
                    <h4 className="text-3xl font-bold font-outfit mb-4">{data.match.partner.name}</h4>
                    
                    <div className="flex flex-col gap-4 text-left mb-6">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="font-semibold">{data.match.partner.gender}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="font-semibold">{data.match.partner.ageGroup}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Exp</p>
                          <p className="font-semibold">{data.match.partner.experience}</p>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Dandiya Vibe</p>
                        <p className="font-semibold">{data.match.partner.vibe}</p>
                      </div>
                    </div>

                    <Button className="w-full text-lg h-12" size="lg">
                      <Sparkles className="w-5 h-5 mr-2" /> SAY HELLO
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">Contact sharing requires mutual consent.</p>
                  </div>
                </div>
              )}

            </Card>
          )}
        </motion.div>

      </div>
    </div>
  )
}
