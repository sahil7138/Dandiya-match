"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { LoginResponse, PassLookupResponse } from "@/types"

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

    const isMatch =
      userGbn === canonical ||
      userGbn === inputUpper ||
      userGbn === inputBase ||
      inputUpper.startsWith(userGbn) ||
      userGbnAlpha === alphanumeric ||
      (digitsOnly && userGbnDigits && parseInt(userGbnDigits, 10) === parseInt(digitsOnly, 10))

    if (!isMatch) {
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
 * Helper to retrieve an attendee's pass number by registered mobile number
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
      include: { registration: true },
    })

    if (user?.registration?.gbnNumber) {
      const base = user.registration.gbnNumber
      const passToShow = user.registration.passType !== "SINGLE" ? `${base}-A` : base
      return {
        success: true,
        gbnNumber: passToShow,
        name: user.name,
      }
    }

    // Check partner phone
    const coupleReg = await prisma.registration.findFirst({
      where: { partnerPhone: cleanPhone },
      include: { user: true },
    })

    if (coupleReg?.gbnNumber) {
      return {
        success: true,
        gbnNumber: `${coupleReg.gbnNumber}-B`,
        name: coupleReg.partnerName || coupleReg.user.name,
      }
    }

    // Check group members phone
    const groupRegs = await prisma.registration.findMany({
      where: {
        passType: { in: ["GROUP", "GANG"] },
      },
      include: { user: true },
    })

    const LETTER_SUFFIXES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    for (const reg of groupRegs) {
      if (!reg.groupMembers) continue
      let members: any[] = []
      if (Array.isArray(reg.groupMembers)) members = reg.groupMembers
      else if (typeof reg.groupMembers === "string") {
        try {
          members = JSON.parse(reg.groupMembers)
        } catch {}
      }
      const matchIndex = members.findIndex(
        (m: any) => m?.phone && normalizePhone(m.phone) === cleanPhone
      )
      if (matchIndex !== -1) {
        const matchedMember = members[matchIndex]
        const assignedPass =
          matchedMember?.passNumber ||
          `${reg.gbnNumber}-${LETTER_SUFFIXES[matchIndex + 1] || matchIndex + 2}`
        return {
          success: true,
          gbnNumber: assignedPass,
          name: matchedMember?.name || `Squad Member ${matchIndex + 2}`,
        }
      }
    }

    return {
      success: false,
      error: "No pass found for this mobile number. Please check the number or register.",
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
