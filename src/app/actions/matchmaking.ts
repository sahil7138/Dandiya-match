"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function generateMatches() {
  try {
    // 1. Get eligible participants with their match profiles
    const eligible = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        registration: {
          passType: "SINGLE",
          paymentStatus: "VERIFIED",
          matchmakingOptIn: true
        },
        matchesAsA: { none: { status: { in: ["PENDING", "LOCKED", "REVEALED"] } } },
        matchesAsB: { none: { status: { in: ["PENDING", "LOCKED", "REVEALED"] } } }
      },
      include: {
        matchProfile: true
      }
    })

    const participants = eligible.filter(u => u.matchProfile != null)

    if (participants.length < 2) {
      return { success: false, error: "Not enough eligible participants to generate matches." }
    }

    // Separate by gender for the specific logic requested
    const males = participants.filter(p => p.matchProfile?.gender === "Male" && p.matchProfile?.preferredGender === "Female")
    const females = participants.filter(p => p.matchProfile?.gender === "Female" && p.matchProfile?.preferredGender === "Male")
    
    // Sort to optimize matching (e.g. by age)
    males.sort((a, b) => a.matchProfile!.age - b.matchProfile!.age)
    females.sort((a, b) => a.matchProfile!.age - b.matchProfile!.age)

    const pairs: any[] = []
    const matchedMaleIds = new Set<string>()
    const matchedFemaleIds = new Set<string>()

    const roundName = `Round ${Date.now()}`
    const revealTime = new Date()
    revealTime.setHours(revealTime.getHours() + 24)

    // Match males and females with strict 1-5 year gap
    for (const female of females) {
      const fAge = female.matchProfile!.age
      
      // Find a suitable male
      const matchIndex = males.findIndex(m => {
        if (matchedMaleIds.has(m.id)) return false
        const mAge = m.matchProfile!.age
        const gap = mAge - fAge
        return gap >= 1 && gap <= 5
      })

      if (matchIndex !== -1) {
        const male = males[matchIndex]
        matchedMaleIds.add(male.id)
        matchedFemaleIds.add(female.id)
        
        pairs.push({
          participantAId: male.id,
          participantBId: female.id,
          revealAt: revealTime,
          status: "LOCKED" as const,
          isLocked: true,
        })
      }
    }

    // What about "Any" or same-sex preferences? 
    // To keep it simple and strict to the prompt ("male should elder but not younger than female and age gap 1-5"),
    // we just use the pairs we found. 

    if (pairs.length === 0) {
      return { success: false, error: "No matches could be made with the strict 1-5 year age gap rule." }
    }

    await prisma.$transaction(async (tx) => {
      const round = await tx.matchmakingRound.create({
        data: {
          name: roundName,
          revealAt: revealTime
        }
      })

      const roundPairs = pairs.map(p => ({ ...p, roundId: round.id }))
      await tx.match.createMany({
        data: roundPairs
      })
    })

    revalidatePath("/admin/matchmaking")
    revalidatePath("/admin/matches")
    return { success: true, message: `Successfully generated ${pairs.length} matches.` }
  } catch (error: any) {
    console.error("Matchmaking error:", error)
    return { success: false, error: "Failed to generate matches." }
  }
}

export async function updateRevealTime(newTime: Date) {
  try {
    await prisma.$transaction([
      prisma.matchmakingRound.updateMany({
        data: { revealAt: newTime }
      }),
      prisma.match.updateMany({
        where: { status: { in: ["PENDING", "LOCKED"] } },
        data: { revealAt: newTime }
      })
    ])
    
    revalidatePath("/admin/matches")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to update reveal time:", error)
    return { success: false, error: "Internal server error" }
  }
}
