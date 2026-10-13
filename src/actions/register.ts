"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PassTypeEnum } from "@prisma/client"

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be exactly 10 digits"),
  passType: z.nativeEnum(PassTypeEnum),
  matchmakingOptIn: z.boolean().default(false),
  
  // Couple fields
  partnerName: z.string().optional(),
  partnerPhone: z.string().optional(),
  
  // Group fields
  member2: z.string().optional(),
  member3: z.string().optional(),
  member4: z.string().optional(),
  member5: z.string().optional(),
  member6: z.string().optional(),
  member7: z.string().optional(),
  member8: z.string().optional(),
  member9: z.string().optional(),
  member10: z.string().optional(),
  
  // Match profile fields
  gender: z.string().optional(),
  preferredGender: z.string().optional(),
  age: z.coerce.number().min(16).max(100).optional(),
  experience: z.string().optional(),
  vibe: z.string().optional(),

  // Social & Match coordination (DPDP Act 2023)
  instagramId: z.string().optional(),
  dpdpConsent: z.boolean().default(false),
  instagramShareConsent: z.boolean().default(false),

  // Payment
  paymentScreenshotUrl: z.string().min(1, "Payment screenshot is required"),
  amount: z.number().min(1),
})

export async function submitRegistration(data: z.infer<typeof registerSchema>) {
  try {
    const validated = registerSchema.parse(data)
    
    // Check Phone uniqueness
    const existingPhone = await prisma.user.findUnique({
      where: { phone: validated.phone }
    })
    
    if (existingPhone) {
      return { success: false, error: "This phone number is already registered." }
    }

    // Determine how many passes this registration needs
    const requiredPassCount =
      validated.passType === PassTypeEnum.GANG
        ? 10
        : validated.passType === PassTypeEnum.GROUP
        ? 4
        : validated.passType === PassTypeEnum.COUPLE
        ? 2
        : 1

    // Collect all already taken GBN pass numbers (from leads and group members)
    const allRegs = await prisma.registration.findMany({
      select: { gbnNumber: true, groupMembers: true },
    })
    const takenPasses = new Set<string>()
    allRegs.forEach((r) => {
      if (r.gbnNumber) takenPasses.add(r.gbnNumber.trim().toUpperCase())
      if (r.groupMembers) {
        let members: any[] = []
        if (Array.isArray(r.groupMembers)) members = r.groupMembers
        else if (typeof r.groupMembers === "string") {
          try {
            members = JSON.parse(r.groupMembers)
          } catch {}
        }
        members.forEach((m: any) => {
          if (m?.passNumber) takenPasses.add(String(m.passNumber).trim().toUpperCase())
        })
      }
    })

    // Assign lowest available distinct GBN numbers (1 to 200)
    const assignedPasses: string[] = []
    for (let i = 1; i <= 200; i++) {
      const passNumber = `GBN-${i.toString().padStart(4, "0")}`
      if (!takenPasses.has(passNumber)) {
        assignedPasses.push(passNumber)
        if (assignedPasses.length === requiredPassCount) {
          break
        }
      }
    }

    if (assignedPasses.length < requiredPassCount) {
      return { success: false, error: "Registration full! Not enough passes are available." }
    }

    const assignedGbn = assignedPasses[0]

    // Business Logic Validation (CRITICAL)
    let finalOptIn = validated.matchmakingOptIn
    if (
      validated.passType === PassTypeEnum.COUPLE ||
      validated.passType === PassTypeEnum.GROUP ||
      validated.passType === PassTypeEnum.GANG
    ) {
      finalOptIn = false
    }

    // DPDP Act 2023 Statutory Consent Validation
    if (!validated.dpdpConsent) {
      return { success: false, error: "DPDP Act consent is mandatory to process registration and issue event passes." }
    }

    // Clean and normalize Instagram Handle
    const rawIg = validated.instagramId ? validated.instagramId.replace(/^@+/, "").trim() : null
    if (finalOptIn && validated.passType === PassTypeEnum.SINGLE) {
      if (!rawIg || rawIg.length < 2) {
        return { success: false, error: "Please enter your Instagram ID so your matched dance partner can coordinate with you." }
      }
      if (!validated.instagramShareConsent) {
        return { success: false, error: "Under the DPDP Act 2023, explicit consent is required to share your Instagram handle with your matched partner." }
      }
    }

    const consentTimestamp = new Date()

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: validated.name,
          phone: validated.phone,
          instagramId: rawIg,
        },
      })

      // 2. Create Match Profile if applicable
      if (finalOptIn && validated.passType === PassTypeEnum.SINGLE) {
        await tx.matchProfile.create({
          data: {
            userId: user.id,
            gender: validated.gender || "Male",
            preferredGender: validated.preferredGender || "Anyone",
            age: validated.age || 18,
            experience: validated.experience || "Beginner",
            vibe: validated.vibe || "Fun & Goofy",
          },
        })
      }

      let groupMembers: any = undefined
      if (validated.passType === PassTypeEnum.COUPLE) {
        groupMembers = [
          {
            id: `${user.id}_partner`,
            name: validated.partnerName || "Couple Partner",
            phone: validated.partnerPhone || validated.phone,
            passNumber: assignedPasses[1],
            role: "Couple Partner",
            memberIndex: 2,
          },
        ]
      } else if (validated.passType === PassTypeEnum.GROUP) {
        groupMembers = [
          {
            id: `${user.id}_m2`,
            name: validated.member2,
            passNumber: assignedPasses[1],
            role: "Squad Member 2",
            memberIndex: 2,
          },
          {
            id: `${user.id}_m3`,
            name: validated.member3,
            passNumber: assignedPasses[2],
            role: "Squad Member 3",
            memberIndex: 3,
          },
          {
            id: `${user.id}_m4`,
            name: validated.member4,
            passNumber: assignedPasses[3],
            role: "Squad Member 4",
            memberIndex: 4,
          },
        ]
      } else if (validated.passType === PassTypeEnum.GANG) {
        const memberNames = [
          validated.member2,
          validated.member3,
          validated.member4,
          validated.member5,
          validated.member6,
          validated.member7,
          validated.member8,
          validated.member9,
          validated.member10,
        ]
        groupMembers = memberNames.map((mName, idx) => ({
          id: `${user.id}_m${idx + 2}`,
          name: mName,
          passNumber: assignedPasses[idx + 1],
          role: `Gang Member ${idx + 2}`,
          memberIndex: idx + 2,
        }))
      }

      // 3. Create Registration
      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          passType: validated.passType,
          gbnNumber: assignedGbn,
          matchmakingOptIn: finalOptIn,
          partnerName: validated.partnerName,
          partnerPhone: validated.partnerPhone,
          groupMembers: groupMembers,
          instagramId: rawIg,
          dpdpConsent: Boolean(validated.dpdpConsent),
          instagramShareConsent: finalOptIn ? Boolean(validated.instagramShareConsent) : false,
          consentTimestamp: consentTimestamp,
          consentVersion: "DPDP-2023-V1",
        }
      })

      // 4. Create Payment
      await tx.payment.create({
        data: {
          registrationId: registration.id,
          amount: validated.amount,
          paymentScreenshotUrl: validated.paymentScreenshotUrl,
          status: "PENDING"
        }
      })

      return { registrationId: registration.id, assignedGbn, user, registration }
    })

    return { 
      success: true, 
      registrationId: result.registrationId, 
      gbnNumber: result.assignedGbn,
      phone: validated.phone 
    }
    
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: error.message || "Something went wrong" }
  }
}
