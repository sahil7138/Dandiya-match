"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { PassTypeEnum } from "@prisma/client"
import { submitRegistration } from "../actions/register"
import { toast } from "sonner"
import { CheckCircle2, ChevronRight, Loader2, UploadCloud } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be exactly 10 digits"),
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
  ageGroup: z.string().optional(),
  experience: z.string().optional(),
  vibe: z.string().optional(),
})

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState("")

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      passType: PassTypeEnum.SINGLE,
      matchmakingOptIn: false,
    }
  })

  const watchPassType = form.watch("passType")
  const watchOptIn = form.watch("matchmakingOptIn")

  const handleNext = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await form.trigger(["name", "phone", "passType"])
      if (watchPassType === PassTypeEnum.COUPLE) {
        isValid = isValid && await form.trigger(["partnerName"])
      } else if (watchPassType === PassTypeEnum.GROUP) {
        isValid = isValid && await form.trigger(["member2", "member3", "member4"])
      } else if (watchPassType === PassTypeEnum.GANG) {
        isValid = isValid && await form.trigger(["member2", "member3", "member4", "member5", "member6", "member7", "member8", "member9", "member10"])
      }
    } else if (step === 2) {
      if (watchPassType === PassTypeEnum.SINGLE && watchOptIn) {
        isValid = await form.trigger(["gender", "preferredGender", "ageGroup", "experience", "vibe"])
      } else {
        isValid = true
      }
    }
    if (isValid) setStep(step + 1)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, upload to S3/Cloudinary. Here we use a fake URL.
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string)
        toast.success("Screenshot uploaded successfully!")
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!screenshotUrl) {
      toast.error("Please upload your payment screenshot")
      return
    }
    
    setIsSubmitting(true)
    
    let amount = 299
    if (data.passType === PassTypeEnum.COUPLE) amount = 549
    if (data.passType === PassTypeEnum.GROUP) amount = 1149
    if (data.passType === PassTypeEnum.GANG) amount = 2799
    
    const res = await submitRegistration({
      ...data,
      paymentScreenshotUrl: screenshotUrl,
      amount,
    })
    
    setIsSubmitting(false)
    
    if (res.success && res.registrationId) {
      setSuccessId(res.registrationId)
    } else {
      toast.error(res.error)
    }
  }

  if (successId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center flex flex-col items-center space-y-6 border-primary/20 bg-card">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
            <CheckCircle2 size={80} />
          </motion.div>
          <h2 className="text-3xl font-bold font-outfit text-primary">You're In! 🎉</h2>
          <p className="text-muted-foreground">Your registration has been received.</p>
          <div className="bg-secondary/10 w-full p-4 rounded-xl border border-secondary/20">
            <p className="font-mono text-sm text-muted-foreground">Registration ID</p>
            <p className="font-bold">{successId.slice(-6).toUpperCase()}</p>
          </div>
          {watchPassType === PassTypeEnum.SINGLE && watchOptIn && (
            <div className="bg-primary/10 text-primary p-4 rounded-xl font-medium border border-primary/20">
              You're officially in the Random Dandiya Partner pool. 🎲
            </div>
          )}
          <Link href="/login" className="w-full">
            <Button className="w-full">GO TO DASHBOARD</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const prices = {
    SINGLE: 299,
    COUPLE: 549,
    GROUP: 1149,
    GANG: 2799
  }

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Home</Link>
      </div>

      <div className="w-full max-w-2xl bg-card rounded-t-3xl border-t-8 border-t-primary p-8 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">✨</div>
        <h1 className="text-4xl font-bold font-outfit text-primary mb-2">GENZ BLING NAVRATRI 2026</h1>
        <p className="text-xl mb-4 font-light text-foreground">Ready to slay this Navratri? 💃🕺</p>
        <div className="text-muted-foreground space-y-2 mt-6 border-l-2 border-primary/30 pl-4">
          <p>📅 17 October 2026</p>
          <p>⏰ 7:00 PM Onwards</p>
          <p>📍 Noupark Turf, Near Premia Society, Narhe</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-6">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card className="p-6 space-y-4 shadow-sm border-border">
              <div className="space-y-2">
                <Label className="text-lg">What's your good name? 👤 <span className="text-red-500">*</span></Label>
                <Input {...form.register("name")} placeholder="Your Full Name" className="h-12 text-lg bg-background" />
                {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
              </div>
            </Card>

            <Card className="p-6 space-y-4 shadow-sm border-border">
              <div className="space-y-2">
                <Label className="text-lg">Drop your digits 📱 <span className="text-red-500">*</span></Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 bg-muted border border-r-0 border-border rounded-l-md font-medium">+91</div>
                  <Input {...form.register("phone")} placeholder="9876543210" maxLength={10} className="h-12 text-lg bg-background rounded-l-none" />
                </div>
                {form.formState.errors.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
              </div>
            </Card>

            <Card className="p-6 space-y-4 shadow-sm border-border">
              <Label className="text-lg">Choose your vibe 🎟️ <span className="text-red-500">*</span></Label>
              <RadioGroup value={watchPassType} onValueChange={(v) => form.setValue("passType", v as PassTypeEnum)} className="gap-4 mt-4">
                {[
                  { id: PassTypeEnum.SINGLE, label: "Solo Pass", sub: "Entry for 1", price: prices.SINGLE },
                  { id: PassTypeEnum.COUPLE, label: "Duo Pass", sub: "Entry for 2", price: prices.COUPLE },
                  { id: PassTypeEnum.GROUP, label: "Bling Squad Pass", sub: "Entry for 4", price: prices.GROUP },
                  { id: PassTypeEnum.GANG, label: "Bling Gang Pass", sub: "Entry for 10", price: prices.GANG }
                ].map((pt) => (
                  <div key={pt.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${watchPassType === pt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={pt.id} id={pt.id} />
                      <Label htmlFor={pt.id} className="font-bold text-lg cursor-pointer flex flex-col">
                        {pt.label}
                        <span className="text-sm font-normal text-muted-foreground">{pt.sub}</span>
                      </Label>
                    </div>
                    <div className="font-bold text-lg text-primary">₹{pt.price}</div>
                  </div>
                ))}
              </RadioGroup>

              {watchPassType === PassTypeEnum.COUPLE && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 space-y-4 border-t mt-4">
                  <div className="bg-secondary/10 text-secondary-foreground p-3 rounded-lg text-sm mb-4 border border-secondary/20">
                    You're already registered as a duo, so Random Dandiya Partner matching isn't available for this pass.
                  </div>
                  <div className="space-y-2">
                    <Label>Partner's Name <span className="text-red-500">*</span></Label>
                    <Input {...form.register("partnerName")} placeholder="Enter their name" />
                  </div>
                </motion.div>
              )}

              {watchPassType === PassTypeEnum.GROUP && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 space-y-4 border-t mt-4">
                  <div className="bg-secondary/10 text-secondary-foreground p-3 rounded-lg text-sm mb-4 border border-secondary/20">
                    Group entries are not eligible for Random Dandiya Partner matching.
                  </div>
                  <div className="space-y-2">
                    <Label>Member 2 Name <span className="text-red-500">*</span></Label>
                    <Input {...form.register("member2")} placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Member 3 Name <span className="text-red-500">*</span></Label>
                    <Input {...form.register("member3")} placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Member 4 Name <span className="text-red-500">*</span></Label>
                    <Input {...form.register("member4")} placeholder="Name" />
                  </div>
                </motion.div>
              )}

              {watchPassType === PassTypeEnum.GANG && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 space-y-4 border-t mt-4">
                  <div className="bg-secondary/10 text-secondary-foreground p-3 rounded-lg text-sm mb-4 border border-secondary/20">
                    Bling Gang entries are not eligible for Random Dandiya Partner matching.
                  </div>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div className="space-y-2" key={i}>
                      <Label>Member {i + 2} Name <span className="text-red-500">*</span></Label>
                      <Input {...form.register(`member${i + 2}` as keyof z.infer<typeof schema>)} placeholder="Name" />
                    </div>
                  ))}
                </motion.div>
              )}
            </Card>
            
            <Button type="button" onClick={handleNext} className="w-full h-14 text-lg rounded-xl" size="lg">
              Next Step <ChevronRight className="ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            {watchPassType === PassTypeEnum.SINGLE && (
              <Card className="p-6 space-y-6 shadow-sm border-primary/50 bg-primary/5">
                <div className="space-y-2">
                  <Label className="text-xl font-bold text-primary font-outfit">Want to enter the Random Dandiya Partner pool? 🎲</Label>
                  <p className="text-muted-foreground text-sm">Join the pool to get matched with a random partner for the night!</p>
                </div>
                
                <RadioGroup 
                  value={watchOptIn ? "yes" : "no"} 
                  onValueChange={(v) => form.setValue("matchmakingOptIn", v === "yes")}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label htmlFor="opt-yes" className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${watchOptIn ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                    <RadioGroupItem value="yes" id="opt-yes" className="sr-only" />
                    <span className="text-2xl mb-2">🎲</span>
                    <span className="font-bold">YES, MATCH ME</span>
                  </Label>
                  <Label htmlFor="opt-no" className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${!watchOptIn ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                    <RadioGroupItem value="no" id="opt-no" className="sr-only" />
                    <span className="text-2xl mb-2">💃</span>
                    <span className="font-bold text-center">NO, I'LL DANCE SOLO</span>
                  </Label>
                </RadioGroup>

                {watchOptIn && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4">
                    <div className="space-y-3">
                      <Label>Your Gender</Label>
                      <RadioGroup onValueChange={(v) => form.setValue("gender", v)} className="flex flex-wrap gap-2">
                        {['Male', 'Female', 'Other'].map(gen => (
                          <Label key={gen} className={`px-4 py-2 rounded-full border cursor-pointer ${form.watch('gender') === gen ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <RadioGroupItem value={gen} className="sr-only" />
                            {gen}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>Preferred Partner Gender</Label>
                      <RadioGroup onValueChange={(v) => form.setValue("preferredGender", v)} className="flex flex-wrap gap-2">
                        {['Male', 'Female', 'Anyone'].map(gen => (
                          <Label key={gen} className={`px-4 py-2 rounded-full border cursor-pointer ${form.watch('preferredGender') === gen ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <RadioGroupItem value={gen} className="sr-only" />
                            {gen}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>Age Group</Label>
                      <RadioGroup onValueChange={(v) => form.setValue("ageGroup", v)} className="flex flex-wrap gap-2">
                        {['18–20', '21–23', '24–26', '27+'].map(age => (
                          <Label key={age} className={`px-4 py-2 rounded-full border cursor-pointer ${form.watch('ageGroup') === age ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <RadioGroupItem value={age} className="sr-only" />
                            {age}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>Dandiya Experience</Label>
                      <RadioGroup onValueChange={(v) => form.setValue("experience", v)} className="flex flex-wrap gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map(exp => (
                          <Label key={exp} className={`px-4 py-2 rounded-full border cursor-pointer ${form.watch('experience') === exp ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <RadioGroupItem value={exp} className="sr-only" />
                            {exp}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>Your Vibe</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Energetic 🔥', 'Chill 😎', 'Fun & Goofy 😂', 'Dance Lover 💃', 'Competitive 🕺', 'Just Here for Garba ✨'].map(vibe => (
                          <Label key={vibe} className={`px-3 py-3 rounded-lg border text-center cursor-pointer text-sm ${form.watch('vibe') === vibe ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <input type="radio" value={vibe} onChange={() => form.setValue("vibe", vibe)} checked={form.watch('vibe') === vibe} className="sr-only" />
                            {vibe}
                          </Label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            )}

            <Card className="p-6 space-y-6 shadow-sm border-border">
              <h3 className="text-2xl font-bold font-outfit text-primary border-b pb-4">Secure the Bag 💸</h3>
              
              <div className="bg-muted p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-48 h-48 bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
                  {/* Placeholder for QR Code */}
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=dandiyamatch@upi&pn=DandiyaMatch&cu=INR" alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-bold text-lg">UPI ID: dandiyamatch@upi</p>
                  <p className="text-muted-foreground">Scan to pay with any UPI app</p>
                </div>
                <div className="w-full py-3 bg-card border rounded-lg font-bold text-xl text-primary">
                  Amount to Pay: ₹{prices[watchPassType]}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label className="text-lg">Upload Your Payment Screenshot <span className="text-red-500">*</span></Label>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {screenshotUrl ? (
                    <div className="text-green-500 font-bold flex items-center gap-2">
                      <CheckCircle2 /> Screenshot Uploaded
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">Tap to upload screenshot</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>



            <div className="bg-card p-6 rounded-xl border text-sm space-y-4 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 h-5 w-5 rounded border-primary accent-primary" />
                <span>I confirm that the information provided is correct and matches my ID.</span>
              </label>
              {watchOptIn && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 h-5 w-5 rounded border-primary accent-primary" />
                  <span>I understand that my Dandiya partner will be selected randomly and revealed 24 hours before the event.</span>
                </label>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-14 rounded-xl">Back</Button>
              <Button type="submit" disabled={isSubmitting} className="w-2/3 h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(193,18,31,0.4)]">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "SUBMIT & JOIN ✨"}
              </Button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  )
}
