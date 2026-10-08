"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PassTypeEnum } from "@prisma/client"
import { submitRegistration } from "../actions/register"
import { toast } from "sonner"
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, UploadCloud, Sparkles, 
  Ticket, Users, User, Heart, ShieldCheck, Copy, Check, QrCode, ArrowRight 
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  passType: z.nativeEnum(PassTypeEnum),
  matchmakingOptIn: z.boolean(),
  partnerName: z.string().optional(),
  partnerPhone: z.string().optional(),
  member2: z.string().optional(),
  member3: z.string().optional(),
  member4: z.string().optional(),
  member5: z.string().optional(),
  member6: z.string().optional(),
  member7: z.string().optional(),
  member8: z.string().optional(),
  member9: z.string().optional(),
  member10: z.string().optional(),
  gender: z.string().optional(),
  preferredGender: z.string().optional(),
  age: z.coerce.number().min(16, "You must be at least 16").max(100, "Invalid age").optional(),
  experience: z.string().optional(),
  vibe: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function RegisterForm() {
  const searchParams = useSearchParams()
  const initialPassParam = searchParams.get("pass") as PassTypeEnum | null

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [copiedUpi, setCopiedUpi] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      phone: "",
      passType: (initialPassParam && Object.values(PassTypeEnum).includes(initialPassParam)) 
        ? initialPassParam 
        : PassTypeEnum.SINGLE,
      matchmakingOptIn: true,
      gender: "Male",
      preferredGender: "Female",
      age: 22,
      experience: "Casual (Can do 2-Taali)",
      vibe: "Energetic & Fast Beats",
    },
  })

  useEffect(() => {
    if (initialPassParam && Object.values(PassTypeEnum).includes(initialPassParam)) {
      form.setValue("passType", initialPassParam)
    }
  }, [initialPassParam, form])

  const watchPassType = form.watch("passType")
  const watchOptIn = form.watch("matchmakingOptIn")

  const passPriceMap: Record<PassTypeEnum, { name: string; price: number; badge: string; entry: string }> = {
    SINGLE: { name: "Solo Pass", price: 299, badge: "🎲 MATCHMAKING ELIGIBLE", entry: "Entry for 1" },
    COUPLE: { name: "Duo Pass", price: 549, badge: "👯 COUPLE / DUO", entry: "Entry for 2" },
    GROUP: { name: "Bling Squad", price: 1149, badge: "⚡ SQUAD OF 4", entry: "Entry for 4" },
    GANG: { name: "Bling Gang", price: 2799, badge: "👑 MEGA CREW (10)", entry: "Entry for 10" },
  }

  const currentPrice = passPriceMap[watchPassType].price

  const handleNext = async () => {
    if (step === 1) {
      const isBasicValid = await form.trigger(["name", "phone", "passType"])
      if (!isBasicValid) return

      if (watchPassType === PassTypeEnum.COUPLE) {
        const isCoupleValid = await form.trigger(["partnerName"])
        if (!isCoupleValid) return
      } else if (watchPassType === PassTypeEnum.GROUP) {
        const isGroupValid = await form.trigger(["member2", "member3", "member4"])
        if (!isGroupValid) return
      } else if (watchPassType === PassTypeEnum.GANG) {
        const isGangValid = await form.trigger([
          "member2", "member3", "member4", "member5", "member6", "member7", "member8", "member9", "member10"
        ])
        if (!isGangValid) return
      }
      setStep(2)
    } else if (step === 2) {
      if (watchPassType === PassTypeEnum.SINGLE && watchOptIn) {
        const isMatchValid = await form.trigger(["gender", "preferredGender", "age", "experience", "vibe"])
        if (!isMatchValid) return
      }
      setStep(3)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string)
        toast.success("Payment screenshot uploaded successfully!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("7709468117@upi")
    setCopiedUpi(true)
    toast.success("UPI ID copied to clipboard!")
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const onSubmit = async (data: FormData) => {
    if (!screenshotUrl) {
      toast.error("Please upload your UPI payment screenshot to complete registration.")
      return
    }

    setIsSubmitting(true)
    const res = await submitRegistration({
      ...data,
      paymentScreenshotUrl: screenshotUrl,
      amount: currentPrice,
    })
    setIsSubmitting(false)

    if (res.success && res.registrationId) {
      setSuccessId(res.registrationId)
      toast.success("Registration submitted successfully!")
    } else {
      toast.error(res.error || "Failed to submit registration")
    }
  }

  if (successId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card rounded-[2.5rem] p-8 md:p-10 border border-primary/40 shadow-[0_0_60px_rgba(255,42,122,0.25)] text-center relative overflow-hidden"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" /> OFFICIAL PASS CONFIRMED
            </div>

            <h2 className="text-3xl font-black font-outfit text-white mb-2">You&apos;re In! 🎉</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Your registration for <strong className="text-white">GENZ BLING NAVRATRI 2026</strong> has been received and payment is pending quick verification.
            </p>

            <div className="bg-black/50 p-5 rounded-2xl border border-white/10 mb-6 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Pass Type:</span>
                <span className="font-bold text-white">{passPriceMap[watchPassType].name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Amount Paid:</span>
                <span className="font-bold text-[#ffb800]">₹{currentPrice}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Verification Status:</span>
                <span className="font-bold text-yellow-400">Pending Admin Review</span>
              </div>
              {watchPassType === PassTypeEnum.SINGLE && watchOptIn && (
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-primary font-semibold">
                  <span>🎲 Secret Dandiya Match Pool:</span>
                  <span className="text-emerald-400 font-bold">Enrolled!</span>
                </div>
              )}
            </div>

            <Link href="/login" className="w-full block">
              <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-lg shadow-primary/30">
                Log In to Attendee Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-black/60 border border-white/10 p-1.5 shadow-xl shadow-primary/20">
            <img
              src="/logo.png"
              alt="GENZ BLING NAVRATRI 2026"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-bold text-[#ffb800] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> GENZ BLING 2026 REGISTRATION
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-outfit text-white mb-3">
            Secure Your Navratri Pass
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            17th October 2026 • Noupark Turf, Narhe, Pune
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex items-center justify-center gap-3 mb-10 max-w-md mx-auto">
          {[
            { num: 1, label: "Pass & Info" },
            { num: 2, label: "Vibe / Match" },
            { num: 3, label: "Payment" },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  step === s.num
                    ? "bg-primary text-white shadow-lg shadow-primary/40 ring-2 ring-primary/40"
                    : step > s.num
                    ? "bg-emerald-500 text-black"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? "text-white font-bold" : "text-zinc-500"}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="flex-1 h-[2px] bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step Form Container */}
        <div className="glass-card rounded-[2rem] p-6 sm:p-10 border border-white/10 shadow-2xl relative">
          
          {/* STEP 1: Pass & Personal Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              {/* Pass Tier Picker */}
              <div>
                <Label className="text-sm font-bold text-white mb-3 block">
                  Select Your Entry Pass
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(passPriceMap) as PassTypeEnum[]).map((type) => {
                    const item = passPriceMap[type]
                    const isSelected = watchPassType === type
                    return (
                      <div
                        key={type}
                        onClick={() => form.setValue("passType", type)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,42,122,0.2)] ring-1 ring-primary"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#ffb800] tracking-wider block">
                              {item.badge}
                            </span>
                            <h4 className="font-bold text-base text-white">{item.name}</h4>
                            <p className="text-xs text-zinc-400">{item.entry}</p>
                          </div>
                          <span className="text-xl font-black font-outfit text-white">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Primary Attendee Details */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffb800]">
                  Primary Attendee Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs text-zinc-300">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Aryan Sharma"
                      {...form.register("name")}
                      className="bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary"
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-zinc-300">WhatsApp Phone (10 digits) *</Label>
                    <div className="flex">
                      <span className="h-12 px-3.5 flex items-center bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-xs font-bold text-zinc-400">
                        +91
                      </span>
                      <Input
                        id="phone"
                        maxLength={10}
                        placeholder="9876543210"
                        {...form.register("phone")}
                        className="bg-black/40 border-white/10 h-12 rounded-l-none rounded-r-xl text-white placeholder:text-zinc-600 focus:border-primary"
                      />
                    </div>
                    {form.formState.errors.phone && (
                      <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditional Couple Partner Inputs */}
              {watchPassType === PassTypeEnum.COUPLE && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                    Duo Partner Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-300">Partner Full Name *</Label>
                      <Input
                        placeholder="e.g. Riya Patel"
                        {...form.register("partnerName")}
                        className="bg-black/40 border-white/10 h-12 rounded-xl text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-300">Partner Phone (Optional)</Label>
                      <Input
                        placeholder="e.g. 9876543211"
                        maxLength={10}
                        {...form.register("partnerPhone")}
                        className="bg-black/40 border-white/10 h-12 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Group Squad Inputs */}
              {watchPassType === PassTypeEnum.GROUP && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                    Squad Member Names (4 Total)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Member 2 Name *"
                      {...form.register("member2")}
                      className="bg-black/40 border-white/10 h-12 rounded-xl text-white"
                    />
                    <Input
                      placeholder="Member 3 Name *"
                      {...form.register("member3")}
                      className="bg-black/40 border-white/10 h-12 rounded-xl text-white"
                    />
                    <Input
                      placeholder="Member 4 Name *"
                      {...form.register("member4")}
                      className="bg-black/40 border-white/10 h-12 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Mega Gang Inputs */}
              {watchPassType === PassTypeEnum.GANG && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                    Gang Member Names (10 Total)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Input
                        key={num}
                        placeholder={`Member ${num} Name *`}
                        {...form.register(`member${num}` as any)}
                        className="bg-black/40 border-white/10 h-11 rounded-xl text-white text-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation button */}
              <div className="pt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold"
                >
                  Continue to Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Vibe & Matchmaking */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              {watchPassType === PassTypeEnum.SINGLE ? (
                <>
                  {/* Matchmaking Opt-In Toggle */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-[#8b5cf6]/10 to-transparent border border-primary/30 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0 mt-0.5">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-base text-white">Join Secret Dandiya Match Pool</h3>
                        <input
                          type="checkbox"
                          checked={watchOptIn}
                          onChange={(e) => form.setValue("matchmakingOptIn", e.target.checked)}
                          className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Free with your Solo Pass! Our algorithm pairs you with a random Dandiya partner based on your energy and preferences. Revealed 24 hours prior on your dashboard.
                      </p>
                    </div>
                  </div>

                  {watchOptIn && (
                    <div className="space-y-6 pt-2">
                      {/* My Gender */}
                      <div>
                        <Label className="text-xs font-bold text-zinc-300 mb-2 block">
                          I Identify As:
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Male", "Female", "Other"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => form.setValue("gender", g)}
                              className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                                form.watch("gender") === g
                                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Partner Gender (User specifically requested both Male and Female options!) */}
                      <div>
                        <Label className="text-xs font-bold text-zinc-300 mb-2 block">
                          Preferred Partner Gender:
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Female", "Male", "Any / Open to All"].map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => form.setValue("preferredGender", pg)}
                              className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                                form.watch("preferredGender") === pg
                                  ? "bg-[#ffb800] text-black border-[#ffb800] shadow-md shadow-[#ffb800]/20 font-bold"
                                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1.5">
                          You can match with a male, female, or anyone based on your preference.
                        </p>
                      </div>

                      {/* Age Input */}
                      <div>
                        <Label htmlFor="age" className="text-xs font-bold text-zinc-300 mb-2 block">
                          Your Age:
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          {...form.register("age")}
                          className="bg-black/40 border-white/10 h-12 w-full sm:w-1/2 rounded-xl text-white px-3 focus:border-primary border outline-none"
                          min="16"
                          max="100"
                        />
                        {form.formState.errors.age && (
                          <p className="text-xs text-red-400 mt-1">{form.formState.errors.age.message}</p>
                        )}
                      </div>

                      {/* Dandiya Dance Experience */}
                      <div>
                        <Label className="text-xs font-bold text-zinc-300 mb-2 block">
                          Dandiya / Garba Experience Level:
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            { id: "Beginner (Need a teacher!)", label: "🌱 Beginner" },
                            { id: "Casual (Can do 2-Taali)", label: "💃 Casual Groover" },
                            { id: "Pro (Dodhiya champion!)", label: "🔥 Dodhiya Pro" },
                          ].map((exp) => (
                            <button
                              key={exp.id}
                              type="button"
                              onClick={() => form.setValue("experience", exp.id)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                form.watch("experience") === exp.id
                                  ? "bg-primary/20 text-white border-primary"
                                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              {exp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Vibe */}
                      <div>
                        <Label className="text-xs font-bold text-zinc-300 mb-2 block">
                          Your Festival Vibe:
                        </Label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            "Energetic & Fast Beats",
                            "Chill & Friendly",
                            "Instagram Aesthetic & Glam",
                            "Pure Traditional Garba",
                          ].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => form.setValue("vibe", v)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                form.watch("vibe") === v
                                  ? "bg-[#8b5cf6]/20 text-white border-[#8b5cf6]"
                                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                              }`}
                            >
                              ✨ {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#ffb800]/20 text-[#ffb800] flex items-center justify-center text-xl">
                    👥
                  </div>
                  <h3 className="font-bold text-lg text-white">Group / Duo Entry Confirmed</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    You have selected a {passPriceMap[watchPassType].name}. Matchmaking is exclusively designed for solo attendees. You and your crew will receive direct access to the turf!
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 px-6 rounded-xl border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Payment & Verification */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              
              {/* Order Summary */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#ffb800] tracking-wider block">
                    {passPriceMap[watchPassType].badge}
                  </span>
                  <h3 className="text-lg font-bold text-white">{passPriceMap[watchPassType].name}</h3>
                  <p className="text-xs text-zinc-400">{passPriceMap[watchPassType].entry}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-outfit text-white">
                    ₹{currentPrice}
                  </span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">No Convenience Fees</span>
                </div>
              </div>

              {/* UPI Payment Box */}
              <div className="p-6 rounded-2xl glass-card border border-primary/20 space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <QrCode className="w-4 h-4 text-primary" /> Step 1: Pay via UPI
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-black/40 border border-white/10">
                  {/* Mock UPI QR Graphic */}
                  <div className="w-36 h-36 bg-white p-2 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-lg">
                    <div className="w-full h-full border-2 border-black/10 rounded flex flex-col items-center justify-center p-2 text-black text-center">
                      <QrCode className="w-16 h-16 text-black mb-1" />
                      <span className="text-[8px] font-bold tracking-tight">SCAN TO PAY ₹{currentPrice}</span>
                      <span className="text-[7px] text-zinc-500 font-mono">GENZ BLING 2026</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-left flex-1">
                    <p className="text-xs text-zinc-300">
                      Scan the QR code or send directly to the organizer UPI ID using GPay, PhonePe, or Paytm:
                    </p>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#ffb800] flex-1">
                        7709468117@upi
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyUpi}
                        className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border-0"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="ml-1">{copiedUpi ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Amount to transfer: <strong className="text-white">₹{currentPrice}</strong>
                    </p>
                  </div>
                </div>

                {/* Screenshot Upload Box */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-white uppercase tracking-wider block">
                    Step 2: Upload Payment Screenshot *
                  </Label>
                  
                  {screenshotUrl ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Screenshot Attached Successfully</p>
                          <p className="text-[10px] text-zinc-400">Ready for verification</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setScreenshotUrl("")}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04]">
                      <UploadCloud className="w-8 h-8 text-primary mb-2" />
                      <p className="text-xs font-bold text-white mb-0.5">Click to upload screenshot</p>
                      <p className="text-[10px] text-zinc-500">Supports PNG, JPG, JPEG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-xl border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit as any)}
                  disabled={isSubmitting}
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-sm shadow-xl shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Complete Registration (₹{currentPrice}) <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>

            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09080e] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
