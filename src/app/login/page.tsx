"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { loginUser } from "../actions/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit number")
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
      toast.success("Logged in successfully")
      router.push("/dashboard")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold font-outfit text-primary mb-2">DANDIYA MATCH</h1>
          </Link>
          <p className="text-muted-foreground">Welcome back, participant.</p>
        </div>

        <Card className="p-6 border-border shadow-lg bg-card">
          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Registered Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 bg-muted border border-r-0 border-border rounded-l-md font-medium">+91</div>
                  <Input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="9876543210" 
                    maxLength={10} 
                    className="h-12 bg-background rounded-l-none" 
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12">GET OTP</Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Enter OTP</Label>
                  <button type="button" onClick={() => setStep("PHONE")} className="text-xs text-primary">Change Number</button>
                </div>
                <Input 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="123456" 
                  maxLength={6} 
                  className="h-12 text-center text-xl tracking-[0.5em] bg-background" 
                  required 
                />
                <p className="text-xs text-muted-foreground text-center pt-2">Hint: Use 123456 for demo</p>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12">
                {isLoading ? "VERIFYING..." : "VERIFY & LOGIN"}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
