"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { loginAdmin } from "@/actions/admin-auth"
import { useRouter } from "next/navigation"
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle } from "lucide-react"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      const msg = "Please enter your admin email address."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (!password.trim()) {
      const msg = "Please enter your admin password."
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    setIsLoading(true)
    try {
      const res = await loginAdmin(email, password)
      if (res.success) {
        toast.success("Admin authenticated successfully! Redirecting...")
        router.push("/admin")
      } else {
        const errorText = res.error || "Invalid admin credentials. Please check your email and password."
        setErrorMessage(errorText)
        toast.error(errorText)
      }
    } catch {
      const errorText = "An error occurred during authentication. Please try again."
      setErrorMessage(errorText)
      toast.error(errorText)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm"
    >
      <Card className="p-8 shadow-2xl border-white/10 bg-card/95 backdrop-blur-xl">
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-lg shadow-primary/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-primary font-bold text-xs uppercase tracking-wider block font-mono">
            ORGANIZER PORTAL
          </span>
          <h1 className="text-2xl font-bold font-outfit text-foreground">
            Welcome back, Admin
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter credentials to manage GenZ Bling Navratri 2026.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="h-11 text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Password
              </Label>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-lg shadow-primary/25 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              "Sign In to Admin Portal"
            )}
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}
