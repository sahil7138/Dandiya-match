import { PassTypeEnum, PaymentStatus } from "@prisma/client"

export interface IndividualPass {
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
  coordinatorPhone?: string | null
}

const LETTER_SUFFIXES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

/**
 * Extracts and generates individual passes for every member of a registration.
 * Handles SINGLE (1), COUPLE (2), GROUP (4), and GANG (10).
 * Works seamlessly with existing and newly submitted registrations.
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
  const passes: IndividualPass[] = []

  // 1. SINGLE PASS (1 attendee)
  if (reg.passType === "SINGLE") {
    passes.push({
      passNumber: baseGbn,
      name: reg.user.name,
      phone: reg.user.phone,
      role: "Solo Attendee (Lead)",
      isLead: true,
      memberIndex: 1,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      coordinatorPhone: reg.coordinatorPhone,
    })
    return passes
  }

  // 2. COUPLE PASS (2 attendees: Lead & Partner)
  if (reg.passType === "COUPLE") {
    passes.push({
      passNumber: `${baseGbn}-A`,
      name: reg.user.name,
      phone: reg.user.phone,
      role: "Couple Lead (Payer)",
      isLead: true,
      memberIndex: 1,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      coordinatorPhone: reg.coordinatorPhone,
    })

    passes.push({
      passNumber: `${baseGbn}-B`,
      name: reg.partnerName || "Couple Partner",
      phone: reg.partnerPhone || reg.user.phone,
      role: "Couple Partner",
      isLead: false,
      memberIndex: 2,
      passType: reg.passType,
      paymentStatus: reg.paymentStatus,
      bookingGbn: baseGbn,
      registrationId: reg.id,
      coordinatorPhone: reg.coordinatorPhone,
    })

    return passes
  }

  // 3. GROUP (4 attendees) or GANG (10 attendees)
  const totalExpected = reg.passType === "GROUP" ? 4 : 10
  const groupLabel = reg.passType === "GROUP" ? "Squad" : "Gang"

  // Lead / Primary Payer
  passes.push({
    passNumber: `${baseGbn}-A`,
    name: reg.user.name,
    phone: reg.user.phone,
    role: `${groupLabel} Lead (Payer)`,
    isLead: true,
    memberIndex: 1,
    passType: reg.passType,
    paymentStatus: reg.paymentStatus,
    bookingGbn: baseGbn,
    registrationId: reg.id,
    coordinatorPhone: reg.coordinatorPhone,
  })

  // Parse group members array
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

  for (let i = 2; i <= totalExpected; i++) {
    const memberData = rawMembers[i - 2]
    const memberName =
      (typeof memberData === "object" ? memberData?.name : memberData) ||
      `${groupLabel} Member ${i}`
    const memberPhone =
      (typeof memberData === "object" ? memberData?.phone : null) || reg.user.phone
    const customPass =
      (typeof memberData === "object" && memberData?.passNumber) ||
      `${baseGbn}-${LETTER_SUFFIXES[i - 1] || i}`

    passes.push({
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
