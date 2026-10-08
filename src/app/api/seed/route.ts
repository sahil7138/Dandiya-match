import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { PassTypeEnum } from "@prisma/client"

export async function GET() {
  try {
    // Clear all existing data
    await prisma.match.deleteMany()
    await prisma.matchmakingRound.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.registration.deleteMany()
    await prisma.matchProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.adminUser.deleteMany()
    await prisma.eventSettings.deleteMany()

    // Create Admin
    await prisma.adminUser.create({
      data: {
        name: "Super Admin",
        email: "admin@dandiya.com",
        passwordHash: "admin123", // Fake hash for demo
        role: "SUPER_ADMIN"
      }
    })

    // Create Settings
    await prisma.eventSettings.create({
      data: {
        eventName: "DANDIYA MATCH",
        eventDate: new Date("2026-10-17"),
        eventTime: "19:00",
        venue: "The Grand Palace Grounds",
        eventDescription: "GenZ Bling Navratri is bringing together music, Garba, Dandiya, DJs and a premium festive experience.",
        contactNumber: "9876543210",
        upiId: "dandiyamatch@upi",
        upiRecipient: "Dandiya Match Event",
      }
    })

    // Helper to create participants
    const createParticipant = async (name: string, phone: string, optIn: boolean, paymentStatus: any, vibe = "Energetic 🔥") => {
      const u = await prisma.user.create({ data: { name, phone } })
      if (optIn) {
        await prisma.matchProfile.create({
          data: { userId: u.id, age: 22, experience: "Intermediate", vibe }
        })
      }
      const r = await prisma.registration.create({
        data: {
          userId: u.id,
          gbnNumber: "GBN-" + Math.floor(Math.random() * 100000),
          passType: PassTypeEnum.SINGLE,
          matchmakingOptIn: optIn,
        }
      })
      await prisma.payment.create({
        data: {
          registrationId: r.id,
          amount: 500,
          paymentScreenshotUrl: "https://fake.url/image.jpg",
          status: paymentStatus
        }
      })
      return u
    }

    // 10 Single participants (8 opted in, 2 opted out)
    await createParticipant("Aisha Sharma", "9000000001", true, "VERIFIED", "Dance Lover 💃")
    await createParticipant("Rahul Verma", "9000000002", true, "VERIFIED", "Chill 😎")
    await createParticipant("Priya Patel", "9000000003", true, "PENDING", "Energetic 🔥")
    await createParticipant("Karan Singh", "9000000004", true, "VERIFIED", "Fun & Goofy 😂")
    await createParticipant("Sneha Desai", "9000000005", true, "VERIFIED", "Just Here for Garba ✨")
    await createParticipant("Vikram Ahuja", "9000000006", true, "VERIFIED", "Competitive 🕺")
    await createParticipant("Neha Gupta", "9000000007", true, "VERIFIED", "Dance Lover 💃")
    await createParticipant("Rohan Joshi", "9000000008", true, "VERIFIED", "Chill 😎")
    
    // Opted out
    await createParticipant("Amit Kumar", "9000000009", false, "VERIFIED")
    await createParticipant("Megha Reddy", "9000000010", false, "VERIFIED")

    // Couple Registration
    const uc = await prisma.user.create({ data: { name: "Aditi & Sameer", phone: "9000000011" } })
    const rc = await prisma.registration.create({
      data: {
        userId: uc.id,
        gbnNumber: "GBN-COUPLE-1",
        passType: PassTypeEnum.COUPLE,
        matchmakingOptIn: false,
        partnerName: "Sameer"
      }
    })
    await prisma.payment.create({
      data: { registrationId: rc.id, amount: 900, paymentScreenshotUrl: "url", status: "VERIFIED" }
    })

    // Group Registration
    const ug = await prisma.user.create({ data: { name: "The Garba Gang", phone: "9000000012" } })
    const rg = await prisma.registration.create({
      data: {
        userId: ug.id,
        gbnNumber: "GBN-GROUP-1",
        passType: PassTypeEnum.GROUP,
        matchmakingOptIn: false,
        groupMembers: [{name: "Sanjay"}, {name: "Tina"}, {name: "Rohit"}]
      }
    })
    await prisma.payment.create({
      data: { registrationId: rg.id, amount: 1600, paymentScreenshotUrl: "url", status: "VERIFIED" }
    })

    return NextResponse.json({ success: true, message: "Database seeded successfully with demo data!" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
