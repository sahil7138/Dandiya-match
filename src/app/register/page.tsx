import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RegisterForm } from "./_components/register-form"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>

      <Footer />
    </div>
  )
}
