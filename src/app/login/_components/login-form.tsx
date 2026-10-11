"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { loginUser, lookupPassByPhone } from "@/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Sparkles, Phone, Ticket, ArrowRight, Loader2, Search, 
  HelpCircle, CheckCircle2, Copy, Check 
} from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [phone, setPhone] = useState("")
  const [passNumber, setPassNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Pass recovery modal / panel
  const [showLookup, setShowLookup] = useState(false)
  const [lookupPhoneInput, setLookupPhoneInput] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [foundPass, setFoundPass] = useState<{ gbnNumber: string; name: string } | null>(null)
  const [copiedPass, setCopiedPass] = useState(false)

  // Auto-populate from URL query parameters (e.g. /login?phone=9876543210&pass=GBN-0001)
  useEffect(() => {
    const queryPhone = searchParams.get("phone")
    const queryPass = searchParams.get("pass")
    if (queryPhone) {
      setPhone(queryPhone.replace(/\D/g, "").slice(-10))
    }
    if (queryPass) {
      setPassNumber(queryPass.trim().toUpperCase())
    }
  }, [searchParams])

  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, "").slice(0, 10)
    setPhone(numeric)
  }

  const handlePassChange = (val: string) => {
    setPassNumber(val.toUpperCase())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number")
      return
    }

    if (!passNumber.trim()) {
      toast.error("Please enter your Pass Number (e.g. GBN-0001)")
      return
    }

    setIsLoading(true)
    try {
      const res = await loginUser(phone, passNumber)
      if (res.success) {
        toast.success("Welcome back! Loading your dashboard...")
        router.push("/dashboard")
      } else {
        toast.error(res.error || "Login failed")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLookupPass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupPhoneInput || lookupPhoneInput.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number")
      return
    }

    setIsLookingUp(true)
    setFoundPass(null)
    try {
      const res = await lookupPassByPhone(lookupPhoneInput)
      if (res.success && res.gbnNumber) {
        setFoundPass({
          gbnNumber: res.gbnNumber,
          name: res.name || "Attendee",
        })
        toast.success("Pass found successfully!")
      } else {
        toast.error(res.error || "No pass found for this mobile number")
      }
    } catch {
      toast.error("Failed to retrieve pass details.")
    } finally {
      setIsLookingUp(false)
    }
  }

  const applyFoundPass = () => {
    if (!foundPass) return
    setPhone(lookupPhoneInput)
    setPassNumber(foundPass.gbnNumber)
    setShowLookup(false)
    toast.success("Pass credentials applied to login form!")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPass(true)
    setTimeout(() => setCopiedPass(false), 2000)
    toast.success("Pass number copied!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-black/60 border border-white/10 p-1 shadow-lg shadow-primary/20">
            <img
              src="/logo.png"
              alt="GENZ BLING NAVRATRI 2026"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-bold text-[#ffb800] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> PASS HOLDER PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
            Attendee Login
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Enter your registered mobile number &amp; pass number to access your dashboard.
          </p>
        </div>

        {/* Main Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Mobile Number Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Registered Mobile Number
              </Label>
              <span className="text-[10px] text-zinc-500 font-mono">10 Digits</span>
            </div>
            <div className="flex">
              <span className="h-12 px-3.5 flex items-center bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-xs font-bold text-zinc-400 select-none">
                +91
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="h-12 bg-black/40 border-white/10 rounded-l-none rounded-r-xl text-white placeholder:text-zinc-600 focus:border-primary text-sm font-mono tracking-wider"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Pass Number Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#ffb800]" /> Pass Number (GBN)
              </Label>
              <button
                type="button"
                onClick={() => {
                  setShowLookup(!showLookup)
                  if (!lookupPhoneInput && phone) setLookupPhoneInput(phone)
                }}
                className="text-[11px] text-[#ffb800] hover:text-white flex items-center gap-1 transition-colors font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                {showLookup ? "Hide Lookup" : "Forgot Pass #?"}
              </button>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={passNumber}
                onChange={(e) => handlePassChange(e.target.value)}
                placeholder="GBN-0001"
                maxLength={20}
                className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary text-sm font-mono uppercase tracking-widest pl-3 pr-10"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs font-mono">
                GBN
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Assigned pass identifier (e.g. <span className="text-zinc-400 font-mono">GBN-0001</span> or <span className="text-zinc-400 font-mono">GBN-COUPLE-1</span>).
            </p>
          </div>

          {/* Pass Lookup Accordion */}
          <AnimatePresence>
            {showLookup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#ffb800]" /> Retrieve Your Pass Number
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLookup(false)}
                    className="text-[10px] text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Enter your registered mobile number below to quickly find your assigned GBN Pass.
                </p>

                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={lookupPhoneInput}
                    onChange={(e) => setLookupPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter registered mobile"
                    maxLength={10}
                    className="h-10 text-xs bg-black/50 border-white/10 rounded-lg text-white font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleLookupPass}
                    disabled={isLookingUp}
                    className="h-10 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg shrink-0"
                  >
                    {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Find Pass"}
                  </Button>
                </div>

                {foundPass && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300 font-medium">Attendee: {foundPass.name}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(foundPass.gbnNumber)}
                        className="text-xs text-[#ffb800] hover:underline flex items-center gap-1"
                      >
                        {copiedPass ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedPass ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-[#ffb800]">
                        {foundPass.gbnNumber}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={applyFoundPass}
                        className="h-7 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-white rounded-md font-bold"
                      >
                        Use in Login
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Pass Credentials...
              </>
            ) : (
              <>
                Verify Pass &amp; Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        {/* Registration CTA */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-400">
            Haven&apos;t booked your GenZ Bling pass yet?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Book Pass Here
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
