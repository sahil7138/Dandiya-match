"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginUser(phone: string, otp: string) {
  try {
    if (otp !== "123456") {
      return { success: false, error: "Invalid OTP. Use 123456 for demo." }
    }
    
    const user = await prisma.user.findUnique({
      where: { phone }
    })
    
    if (!user) {
      return { success: false, error: "No account found with this phone number." }
    }

    if (user.status === "BLOCKED") {
      return { success: false, error: "This account has been blocked." }
    }

    // Set a simple cookie session for demo
    const cookieStore = await cookies()
    cookieStore.set("user_session", user.id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 // 1 day
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: "Something went wrong" }
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
  redirect("/login")
}
