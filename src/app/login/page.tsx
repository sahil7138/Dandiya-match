import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LoginForm } from "./_components/login-form"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        {/* Glow ambient circle */}
        <div className="absolute w-[500px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Loading login portal...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
