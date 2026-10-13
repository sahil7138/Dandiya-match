import { PassTypeEnum, PaymentStatus } from "@prisma/client"

export interface IndividualPass {
  id: string
  passNumber: string
  name: string
  phone?: string | null
  role: string
  isLead: boolean
  memberIndex: number
  passType: PassTypeEnum
  paymentStatus: PaymentStatus
  bookingGbn: string
  registrationId: string
  leadName: string
  leadPhone: string
  coordinatorPhone?: string | null
}

/**
 * Parses numeric part from a GBN pass number (e.g. "GBN-0005" -> 5)
 */
function parseGbnDigits(gbn: string): number {
  const digits = gbn.replace(/\D/g, "")
  return digits ? parseInt(digits, 10) : 0
}

/**
 * Formats a number to GBN format (e.g. 6 -> "GBN-0006")
 */
function formatGbn(num: number): string {
  return `GBN-${num.toString().padStart(4, "0")}`
}

/**
 * Extracts and generates individual passes for every member of a registration.
 * Handles SINGLE (1), COUPLE (2), GROUP (4), and GANG (10).
 * Every attendee gets their own separate ID and different GBN pass (no letter suffixes A, B, C, D).
 */
export function getIndividualPasses(reg: {
  id: string
  gbnNumber: string
  passType: PassTypeEnum
  paymentStatus: PaymentStatus
  partnerName?: string | null
  partnerPhone?: string | null
  groupMembers?: any
  coordinatorPhone?: string | null
  user: {
    name: string
    phone: string
  }
}): IndividualPass[] {
  const baseGbn = reg.gbnNumber
  const baseNum = parseGbnDigits(baseGbn)
  const passes: IndividualPass[] = []

  // 1. SINGLE PASS (1 attendee)
  if (reg.passType === "SINGLE") {
    passes.push({
      id: reg.id,
      passNumber: baseGbn,
      name: reg.user.name,
      phone: reg.user.phone,
      role: "Solo Attendee",
      isLead: true,
      memberIndex: 1,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      leadName: reg.user.name,
      leadPhone: reg.user.phone,
      coordinatorPhone: reg.coordinatorPhone,
    })
    return passes
  }

  // Parse raw members array if present
  let rawMembers: any[] = []
  if (Array.isArray(reg.groupMembers)) {
    rawMembers = reg.groupMembers
  } else if (typeof reg.groupMembers === "string") {
    try {
      rawMembers = JSON.parse(reg.groupMembers)
    } catch {
      rawMembers = []
    }
  }

  // 2. COUPLE PASS (2 attendees: Lead & Partner)
  if (reg.passType === "COUPLE") {
    // Lead
    passes.push({
      id: reg.id,
      passNumber: baseGbn,
      name: reg.user.name,
      phone: reg.user.phone,
      role: "Couple Lead (Payer)",
      isLead: true,
      memberIndex: 1,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      leadName: reg.user.name,
      leadPhone: reg.user.phone,
      coordinatorPhone: reg.coordinatorPhone,
    })

    // Partner
    const partnerData = rawMembers[0]
    let partnerPass = ""
    if (typeof partnerData === "object" && partnerData?.passNumber) {
      partnerPass = partnerData.passNumber.replace(/-[A-Z]$/, "")
    }
    if (!partnerPass) {
      partnerPass = formatGbn(baseNum > 0 ? baseNum + 1 : 2)
    }

    passes.push({
      id: (typeof partnerData === "object" && partnerData?.id) || `${reg.id}_m2`,
      passNumber: partnerPass,
      name: reg.partnerName || (typeof partnerData === "object" && partnerData?.name) || "Couple Partner",
      phone: reg.partnerPhone || (typeof partnerData === "object" && partnerData?.phone) || reg.user.phone,
      role: "Couple Partner",
      isLead: false,
      memberIndex: 2,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      leadName: reg.user.name,
      leadPhone: reg.user.phone,
      coordinatorPhone: reg.coordinatorPhone,
    })

    return passes
  }

  // 3. GROUP (4 attendees) or GANG (10 attendees)
  const totalExpected = reg.passType === "GROUP" ? 4 : 10
  const groupLabel = reg.passType === "GROUP" ? "Squad" : "Gang"

  // Lead / Primary Payer
  passes.push({
    id: reg.id,
    passNumber: baseGbn,
    name: reg.user.name,
    phone: reg.user.phone,
    role: `${groupLabel} Lead (Payer)`,
    isLead: true,
    memberIndex: 1,
    passType: reg.passType,
    paymentStatus: reg.paymentStatus,
    bookingGbn: baseGbn,
    registrationId: reg.id,
    leadName: reg.user.name,
    leadPhone: reg.user.phone,
    coordinatorPhone: reg.coordinatorPhone,
  })

  for (let i = 2; i <= totalExpected; i++) {
    const memberData = rawMembers[i - 2]
    const memberName =
      (typeof memberData === "object" ? memberData?.name : memberData) ||
      `${groupLabel} Member ${i}`
    const memberPhone =
      (typeof memberData === "object" ? memberData?.phone : null) || reg.user.phone

    let customPass = ""
    if (typeof memberData === "object" && memberData?.passNumber) {
      // Remove any legacy -A, -B, etc.
      const raw = memberData.passNumber
      customPass = raw.includes("-") && /[A-Z]$/.test(raw)
        ? formatGbn(baseNum > 0 ? baseNum + (i - 1) : i)
        : raw
    }
    if (!customPass) {
      customPass = formatGbn(baseNum > 0 ? baseNum + (i - 1) : i)
    }

    const memberId =
      (typeof memberData === "object" && memberData?.id) ||
      `${reg.id}_m${i}`

    passes.push({
      id: memberId,
      passNumber: customPass,
      name: memberName,
      phone: memberPhone,
      role: `${groupLabel} Member ${i}`,
      isLead: false,
      memberIndex: i,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      leadName: reg.user.name,
      leadPhone: reg.user.phone,
      coordinatorPhone: reg.coordinatorPhone,
    })
  }

  return passes
}

/**
 * Calculates total attendees / individual passes across a list of registrations.
 */
export function countTotalPasses(registrations: { passType: PassTypeEnum }[]): number {
  return registrations.reduce((sum, reg) => {
    switch (reg.passType) {
      case "SINGLE":
        return sum + 1
      case "COUPLE":
        return sum + 2
      case "GROUP":
        return sum + 4
      case "GANG":
        return sum + 10
      default:
        return sum + 1
    }
  }, 0)
}
