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

    // Auto-assign the lowest available GBN number (1 to 100)
    const registrations = await prisma.registration.findMany({
      select: { gbnNumber: true },
      where: { gbnNumber: { startsWith: "GBN-" } }
    })
    const takenPasses = new Set(registrations.map(r => r.gbnNumber))
    
    let assignedGbn = null
    for (let i = 1; i <= 100; i++) {
      const passNumber = `GBN-${i.toString().padStart(4, '0')}`
      if (!takenPasses.has(passNumber)) {
        assignedGbn = passNumber
        break
      }
    }

    if (!assignedGbn) {
      return { success: false, error: "Registration full! All 100 passes have been claimed." }
    }

    // Business Logic Validation (CRITICAL)
    let finalOptIn = validated.matchmakingOptIn
    if (validated.passType === PassTypeEnum.COUPLE || validated.passType === PassTypeEnum.GROUP || validated.passType === PassTypeEnum.GANG) {
      finalOptIn = false
    }

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: validated.name,
          phone: validated.phone,
        }
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
          }
        })
      }

      let groupMembers: any = undefined;
      if (validated.passType === PassTypeEnum.GROUP) {
        groupMembers = [
          { name: validated.member2 },
          { name: validated.member3 },
          { name: validated.member4 }
        ]
      } else if (validated.passType === PassTypeEnum.GANG) {
        groupMembers = [
          { name: validated.member2 },
          { name: validated.member3 },
          { name: validated.member4 },
          { name: validated.member5 },
          { name: validated.member6 },
          { name: validated.member7 },
          { name: validated.member8 },
          { name: validated.member9 },
          { name: validated.member10 }
        ]
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

      return registration.id
    })

    return { success: true, registrationId: result }
    
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: error.message || "Something went wrong" }
  }
}
