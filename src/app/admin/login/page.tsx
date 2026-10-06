"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { loginAdmin } from "../../actions/admin-auth"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await loginAdmin(email, password)
    setIsLoading(false)
    if (res.success) {
      toast.success("Admin logged in")
      router.push("/admin")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <Card className="p-8 shadow-lg border-border bg-card">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-primary font-bold text-xl tracking-tight">Dandiya Match</h1>
            <h2 className="text-2xl font-bold font-outfit text-foreground">Welcome back, Admin</h2>
            <p className="text-sm text-muted-foreground">Manage your Dandiya Match event</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@dandiya.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot Password?</a>
              </div>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
            </div>
            
            <div className="flex items-center space-x-2 pt-2 pb-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me</Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
