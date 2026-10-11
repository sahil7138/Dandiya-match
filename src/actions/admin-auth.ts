"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function loginAdmin(emailInput: string, passwordInput: string) {
  try {
    const email = emailInput.trim().toLowerCase()
    const password = passwordInput.trim()

    if (!email || !password) {
      return { success: false, error: "Email and password are required." }
    }

    let authenticatedAdminId: string | null = null

    // 1. Check environment variables (ADMIN_EMAIL & ADMIN_PASSWORD) with default fallback
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@dandiya.com").trim().toLowerCase()
    const envAdminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim()

    if (envAdminEmail && envAdminPassword) {
      if (secureCompare(email, envAdminEmail) && secureCompare(password, envAdminPassword)) {
        authenticatedAdminId = "env-admin"
      }
    }

    // 2. If not matched via env, check database AdminUser
    if (!authenticatedAdminId) {
      try {
        const adminUser = await prisma.adminUser.findUnique({
          where: { email },
        })

        if (adminUser) {
          const hashedInput = hashPassword(password)
          const isHashedMatch = secureCompare(hashedInput, adminUser.passwordHash)
          const isDirectMatch = secureCompare(password, adminUser.passwordHash)

          if (isHashedMatch || isDirectMatch) {
            authenticatedAdminId = adminUser.id
          }
        }
      } catch (dbErr) {
        console.error("Admin DB lookup error:", dbErr)
      }
    }

    if (!authenticatedAdminId) {
      return { success: false, error: "Invalid admin email or password. Please verify your credentials." }
    }

    // Generate secure random session token
    const sessionToken = crypto.randomBytes(32).toString("hex")
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "An unexpected authentication error occurred." }
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}
