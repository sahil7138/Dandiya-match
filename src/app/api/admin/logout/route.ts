import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  })
  cookieStore.delete("admin_session")

  return NextResponse.json({ success: true, message: "Logged out successfully" })
}

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  })
  cookieStore.delete("admin_session")

  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
