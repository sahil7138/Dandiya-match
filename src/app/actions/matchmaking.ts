"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function generateMatches() {
  try {
    // 1. Get eligible participants
    const eligible = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        registration: {
          passType: "SINGLE",
          paymentStatus: "VERIFIED",
          matchmakingOptIn: true
        }
      },
      select: { id: true }
    })

    if (eligible.length < 2) {
      return { success: false, error: "Not enough eligible participants to generate matches." }
    }

    // 2. Shuffle using Fisher-Yates
    const shuffled = [...eligible]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const roundName = `Round ${Date.now()}`
    
    // Configured reveal time (mocked for demo as tomorrow 6PM)
    const revealTime = new Date()
    revealTime.setHours(revealTime.getHours() + 24)

    await prisma.$transaction(async (tx) => {
      const round = await tx.matchmakingRound.create({
        data: {
          name: roundName,
          revealAt: revealTime
        }
      })

      const pairs = []
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        pairs.push({
          roundId: round.id,
          participantAId: shuffled[i].id,
          participantBId: shuffled[i+1].id,
          revealAt: revealTime,
          status: "LOCKED" as const, // Automatically locked per requirements or pending, I will use LOCKED
          isLocked: true,
        })
      }

      if (pairs.length > 0) {
        await tx.match.createMany({
          data: pairs
        })
      }
    })

    revalidatePath("/admin/matchmaking")
    return { success: true, message: `Successfully generated ${Math.floor(shuffled.length / 2)} matches.` }
  } catch (error: any) {
    console.error("Matchmaking error:", error)
    return { success: false, error: "Failed to generate matches." }
  }
}
