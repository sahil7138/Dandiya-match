export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

import { AdminLoginForm } from "./_components/admin-login-form"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <AdminLoginForm />
    </div>
  )
}
