"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAdmin(email: string, password: string) {
  if (email === "admin@dandiya.com" && password === "admin123") {
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "admin_id_here", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24
    })
    return { success: true }
  }
  return { success: false, error: "Invalid admin credentials" }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}
