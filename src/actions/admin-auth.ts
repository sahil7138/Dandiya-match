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

    // 1. Check database AdminUser FIRST (so password updates take immediate effect)
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

    // 2. If not matched via DB, check environment variables with fallback to new organizer credentials
    if (!authenticatedAdminId) {
      const envAdminEmail = (process.env.ADMIN_EMAIL || "rccindia@webworksstudios.com").trim().toLowerCase()
      const envAdminPassword = (process.env.ADMIN_PASSWORD || "WebAdminK@12").trim()

      if (envAdminEmail && envAdminPassword) {
        if (secureCompare(email, envAdminEmail) && secureCompare(password, envAdminPassword)) {
          authenticatedAdminId = "env-admin"
        }
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

/**
 * Changes admin password with verification and statutory audit logging.
 */
export async function changeAdminPassword(formData: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<{
  success: boolean
  error?: string
  message?: string
}> {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session required." }
  }

  const { currentPassword, newPassword, confirmPassword } = formData

  if (!currentPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
    return { success: false, error: "All password fields are required." }
  }

  if (newPassword.trim().length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." }
  }

  if (newPassword.trim() !== confirmPassword.trim()) {
    return { success: false, error: "New password and confirmation password do not match." }
  }

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "rccindia@webworksstudios.com").trim().toLowerCase()
    const envPassword = (process.env.ADMIN_PASSWORD || "WebAdminK@12").trim()

    // 1. Fetch current admin from DB
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: "SUPER_ADMIN" },
          { role: "ADMIN" }
        ]
      }
    })

    let isCurrentValid = false

    if (adminUser) {
      const hashedCurrent = hashPassword(currentPassword.trim())
      const isHashMatch = secureCompare(hashedCurrent, adminUser.passwordHash)
      const isDirectMatch = secureCompare(currentPassword.trim(), adminUser.passwordHash)
      if (isHashMatch || isDirectMatch) {
        isCurrentValid = true
      }
    }

    // Also check against env password if not matched in DB
    if (!isCurrentValid && envPassword) {
      if (secureCompare(currentPassword.trim(), envPassword)) {
        isCurrentValid = true
      }
    }

    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." }
    }

    // 2. Hash new password and update in DB
    const newPasswordHash = hashPassword(newPassword.trim())

    if (adminUser) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.adminUser.create({
        data: {
          name: "RCC Super Admin",
          email: adminEmail,
          passwordHash: newPasswordHash,
          role: "SUPER_ADMIN"
        }
      })
    }

    // 3. Log audit event
    try {
      await prisma.auditLog.create({
        data: {
          adminId: adminUser?.id || "ADMIN",
          action: "ADMIN_PASSWORD_CHANGED",
          entityType: "ADMIN_USER",
          entityId: adminEmail,
          metadata: {
            timestamp: new Date().toISOString(),
            ip: "ADMIN_PORTAL"
          }
        }
      })
    } catch (auditErr) {
      console.warn("Audit log warning on password change:", auditErr)
    }

    return {
      success: true,
      message: "Password changed successfully! Please use your new password for future logins."
    }
  } catch (err: any) {
    console.error("Change password error:", err)
    return { success: false, error: err?.message || "Failed to update password." }
  }
}

/**
 * Returns current logged-in admin identity
 */
export async function getAdminProfile() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) return null

  const adminEmail = (process.env.ADMIN_EMAIL || "rccindia@webworksstudios.com").trim().toLowerCase()
  try {
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: "SUPER_ADMIN" },
          { role: "ADMIN" }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })
    return admin || { email: adminEmail, name: "RCC Super Admin", role: "SUPER_ADMIN" }
  } catch {
    return { email: adminEmail, name: "RCC Super Admin", role: "SUPER_ADMIN" }
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  })
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}
