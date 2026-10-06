"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function approvePayment(paymentId: string) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) return { success: false, error: "Unauthorized" }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: true }
    })
    
    if (!payment) return { success: false, error: "Payment not found" }

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "VERIFIED" }
    })

    // Update registration
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { paymentStatus: "VERIFIED" }
    })

    revalidatePath("/admin/payments")
    revalidatePath("/admin/participants")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to approve payment" }
  }
}

export async function rejectPayment(paymentId: string, reason: string) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value
  if (!isAdmin) return { success: false, error: "Unauthorized" }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })
    
    if (!payment) return { success: false, error: "Payment not found" }

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", rejectionReason: reason }
    })

    // Update registration
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { paymentStatus: "REJECTED" }
    })

    revalidatePath("/admin/payments")
    revalidatePath("/admin/participants")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to reject payment" }
  }
}
