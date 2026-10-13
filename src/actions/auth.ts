"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { LoginResponse, PassLookupResponse } from "@/types"
import { getIndividualPasses } from "@/lib/passes"

/**
 * Normalizes user input for phone number (extracting last 10 digits)
 */
function normalizePhone(rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/\D/g, "")
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
}

/**
 * Normalizes pass number to canonical formats for flexible matching
 */
function normalizePassNumber(rawPass: string): {
  canonical: string
  digitsOnly: string
  alphanumeric: string
} {
  const trimmed = rawPass.trim().toUpperCase()
  const alphanumeric = trimmed.replace(/[^A-Z0-9]/g, "")
  const digitsOnly = trimmed.replace(/\D/g, "")

  // If user typed 'GBN0001' or 'GBN 0001' or 'GBN-0001'
  let canonical = trimmed
  if (alphanumeric.startsWith("GBN")) {
    const afterGbn = alphanumeric.slice(3)
    canonical = afterGbn ? `GBN-${afterGbn}` : "GBN"
  } else if (/^\d+$/.test(trimmed)) {
    // If user only typed digits like '1' or '0001'
    canonical = `GBN-${trimmed.padStart(4, "0")}`
  }

  return { canonical, digitsOnly, alphanumeric }
}

/**
 * Authenticate attendee using registered mobile number and pass number
 */
export async function loginUser(
  phone: string,
  passNumber: string
): Promise<LoginResponse> {
  try {
    const cleanPhone = normalizePhone(phone)
    if (!cleanPhone || cleanPhone.length !== 10) {
      return {
        success: false,
        error: "Please enter a valid 10-digit registered mobile number.",
      }
    }

    if (!passNumber || !passNumber.trim()) {
      return {
        success: false,
        error: "Please enter your Pass Number (e.g. GBN-0001).",
      }
    }

    const { canonical, digitsOnly, alphanumeric } = normalizePassNumber(passNumber)

    // 1. Look up primary user by phone
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { registration: true },
    })

    // 2. If not found as primary, check if this phone is registered as couple partner or group member
    if (!user || !user.registration) {
      const coupleReg = await prisma.registration.findFirst({
        where: { partnerPhone: cleanPhone },
        include: { user: true },
      })

      if (coupleReg && coupleReg.user) {
        user = {
          ...coupleReg.user,
          registration: coupleReg,
        }
      } else {
        // Check group members
        const groupRegs = await prisma.registration.findMany({
          where: {
            passType: { in: ["GROUP", "GANG"] },
          },
          include: { user: true },
        })

        for (const reg of groupRegs) {
          if (!reg.groupMembers) continue
          let members: any[] = []
          if (Array.isArray(reg.groupMembers)) members = reg.groupMembers
          else if (typeof reg.groupMembers === "string") {
            try {
              members = JSON.parse(reg.groupMembers)
            } catch {}
          }
          if (members.some((m: any) => m?.phone && normalizePhone(m.phone) === cleanPhone)) {
            user = {
              ...reg.user,
              registration: reg,
            }
            break
          }
        }
      }
    }

    // 3. Check if account exists
    if (!user || !user.registration) {
      return {
        success: false,
        error: "No registered pass found with this mobile number. Please check your number or book a pass.",
      }
    }

    // 4. Check if account is blocked
    if (user.status === "BLOCKED") {
      return {
        success: false,
        error: "This account has been blocked by event organizers. Please contact support.",
      }
    }

    // 5. Verify Pass Number
    const userGbn = user.registration.gbnNumber.trim().toUpperCase()
    const userGbnAlpha = userGbn.replace(/[^A-Z0-9]/g, "")
    const userGbnDigits = userGbn.replace(/\D/g, "")

    const inputUpper = passNumber.trim().toUpperCase()
    const inputBase = inputUpper.replace(/-[A-Z0-9]+$/, "")

    // Check if input matches base GBN or any group member's distinct pass number
    let memberPassMatch = false
    if (user.registration.groupMembers) {
      let members: any[] = []
      if (Array.isArray(user.registration.groupMembers)) {
        members = user.registration.groupMembers
      } else if (typeof user.registration.groupMembers === "string") {
        try {
          members = JSON.parse(user.registration.groupMembers)
        } catch {}
      }
      memberPassMatch = members.some((m: any) => {
        const mPass = String(m?.passNumber || "").trim().toUpperCase()
        return mPass && (mPass === inputUpper || mPass === canonical)
      })
    }

    const isPendingLogin =
      user.registration.paymentStatus === "PENDING" &&
      (inputUpper === "PENDING" || inputUpper === "STATUS" || digitsOnly === cleanPhone)

    const isMatch =
      isPendingLogin ||
      memberPassMatch ||
      userGbn === canonical ||
      userGbn === inputUpper ||
      userGbn === inputBase ||
      inputUpper.startsWith(userGbn) ||
      userGbnAlpha === alphanumeric ||
      (digitsOnly && userGbnDigits && parseInt(userGbnDigits, 10) === parseInt(digitsOnly, 10))

    if (!isMatch) {
      if (user.registration.paymentStatus === "PENDING") {
        return {
          success: false,
          error: `Payment for +91 ${cleanPhone} is currently under verification. Pass number will only be issued once verified by organizers.`,
        }
      }
      if (user.registration.paymentStatus === "REJECTED") {
        return {
          success: false,
          error: `Payment verification was declined for mobile +91 ${cleanPhone}. Please contact event organizers.`,
        }
      }
      return {
        success: false,
        error: `Invalid Pass Number for mobile +91 ${cleanPhone}. Please check your GBN pass number (e.g. GBN-0001).`,
      }
    }

    // 6. Set session cookie (valid for 7 days)
    const cookieStore = await cookies()
    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    })

    return { success: true }
  } catch (error: any) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Something went wrong during login. Please try again.",
    }
  }
}

/**
 * Helper to retrieve an attendee's pass number by registered mobile number.
 * Pass number is ONLY issued and visible once payment is VERIFIED.
 */
export async function lookupPassByPhone(phone: string): Promise<PassLookupResponse> {
  try {
    const cleanPhone = normalizePhone(phone)
    if (!cleanPhone || cleanPhone.length !== 10) {
      return {
        success: false,
        error: "Please enter a valid 10-digit mobile number.",
      }
    }

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { registration: { include: { user: true } } },
    })

    let reg: any = user?.registration
    let matchedName = user?.name || "Attendee"

    // Check partner phone
    if (!reg) {
      const coupleReg = await prisma.registration.findFirst({
        where: { partnerPhone: cleanPhone },
        include: { user: true },
      })
      if (coupleReg) {
        reg = coupleReg
        matchedName = coupleReg.partnerName || "Couple Partner"
      }
    }

    // Check group members phone
    if (!reg) {
      const groupRegs = await prisma.registration.findMany({
        where: { passType: { in: ["GROUP", "GANG"] } },
        include: { user: true },
      })
      for (const gReg of groupRegs) {
        if (!gReg.groupMembers) continue
        let members: any[] = []
        if (Array.isArray(gReg.groupMembers)) members = gReg.groupMembers
        else if (typeof gReg.groupMembers === "string") {
          try { members = JSON.parse(gReg.groupMembers) } catch {}
        }
        const m = members.find((x: any) => x?.phone && normalizePhone(x.phone) === cleanPhone)
        if (m) {
          reg = gReg
          matchedName = m.name || "Squad Member"
          break
        }
      }
    }

    if (!reg) {
      return {
        success: false,
        error: "No booking found with this mobile number. Please check your number or register.",
      }
    }

    // Strict rule: Pass number only visible after verifying participant!
    if (reg.paymentStatus === "PENDING") {
      return {
        success: false,
        error: `Booking found for ${matchedName}, but payment is pending verification. Pass number will only be issued once approved by organizers.`,
      }
    }

    if (reg.paymentStatus === "REJECTED") {
      return {
        success: false,
        error: `Payment verification was declined for ${matchedName}. Please contact event organizers.`,
      }
    }

    // Payment is VERIFIED: return the distinct pass
    const allPasses = getIndividualPasses(reg)
    const myPass =
      allPasses.find(
        (p) =>
          (p.phone && normalizePhone(p.phone) === cleanPhone) ||
          (p.isLead && normalizePhone(reg.user?.phone || "") === cleanPhone)
      ) || allPasses[0]

    return {
      success: true,
      gbnNumber: myPass.passNumber,
      name: myPass.name,
    }
  } catch (err: any) {
    console.error("Lookup error:", err)
    return {
      success: false,
      error: "Unable to retrieve pass number at this moment.",
    }
  }
}

/**
 * Clear session and redirect to login
 */
export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
  redirect("/login")
}
