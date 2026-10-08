import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardClient from "./client"

async function getDashboardData() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_session")?.value
  
  if (!userId) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      registration: {
        include: { payment: true }
      },
      matchProfile: true,
    }
  })

  if (!user || !user.registration) {
    const cookieStore = await cookies()
    cookieStore.delete("user_session")
    redirect("/login")
  }

  // Get active match if opted in
  let matchData = null;
  if (user.registration.matchmakingOptIn) {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { participantAId: user.id },
          { participantBId: user.id }
        ],
        status: { in: ["LOCKED", "REVEALED"] }
      },
      include: {
        participantA: { include: { matchProfile: true } },
        participantB: { include: { matchProfile: true } },
        round: true
      }
    })

    if (match) {
      const isA = match.participantAId === user.id
      const partner = isA ? match.participantB : match.participantA
      
      const isTimePassed = new Date() >= match.revealAt;
      const isRevealed = match.status === "REVEALED" || isTimePassed;

      if (isTimePassed && match.status !== "REVEALED") {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: "REVEALED" }
        }).catch(console.error); // Catch error if any, don't fail the page load
      }
      
      matchData = {
        id: match.id,
        status: isRevealed ? "REVEALED" : match.status,
        revealAt: match.revealAt.toISOString(),
        partner: isRevealed ? {
          name: partner.name,
          gender: partner.matchProfile?.gender,
          age: partner.matchProfile?.age,
          experience: partner.matchProfile?.experience,
          vibe: partner.matchProfile?.vibe,
        } : null
      }
    }
  }

  return {
    user: {
      name: user.name,
      phone: user.phone,
    },
    registration: {
      gbnNumber: user.registration.gbnNumber,
      passType: user.registration.passType,
      paymentStatus: user.registration.paymentStatus,
      matchmakingOptIn: user.registration.matchmakingOptIn,
      partnerName: user.registration.partnerName,
      groupMembers: user.registration.groupMembers as any,
      rejectionReason: user.registration.payment?.rejectionReason,
    },
    match: matchData
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
