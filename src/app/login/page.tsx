"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { loginUser } from "../actions/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Phone, Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit registered phone number")
      return
    }
    setStep("OTP")
    toast.success("OTP sent to your number")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await loginUser(phone, otp)
    setIsLoading(false)
    if (res.success) {
      toast.success("Logged in successfully!")
      router.push("/dashboard")
    } else {
      toast.error(res.error || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        {/* Glow ambient circle */}
        <div className="absolute w-[500px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Card Container */}
          <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-black/60 border border-white/10 p-1 shadow-lg shadow-primary/20">
                <img
                  src="/logo.png"
                  alt="GENZ BLING NAVRATRI 2026"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-bold text-[#ffb800] uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> PASS HOLDER ACCESS
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                Attendee Login
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Access your Dandiya pass, payment status & secret match.
              </p>
            </div>

            {step === "PHONE" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-300">
                    Registered Mobile Number
                  </Label>
                  <div className="flex">
                    <span className="h-12 px-3.5 flex items-center bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-xs font-bold text-zinc-400">
                      +91
                    </span>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="h-12 bg-black/40 border-white/10 rounded-l-none rounded-r-xl text-white placeholder:text-zinc-600 focus:border-primary text-sm font-mono"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Use the same 10-digit number entered during ticket booking.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95"
                >
                  Get One-Time Password (OTP) <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-zinc-300">
                      Enter Verification Code
                    </Label>
                    <button
                      type="button"
                      onClick={() => setStep("PHONE")}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change Number
                    </button>
                  </div>

                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-[0.4em] font-mono font-bold bg-black/40 border-white/10 rounded-xl text-white focus:border-primary"
                    required
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1">
                    <span>Sent to +91 {phone}</span>
                    <span className="text-[#ffb800] font-mono">Demo OTP: 123456</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Pass...
                    </>
                  ) : (
                    <>
                      Verify & Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Bottom link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-zinc-400">
                Haven&apos;t booked your pass yet?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
