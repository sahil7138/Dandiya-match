import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
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

  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  })
  response.cookies.delete("admin_session")
  return response
}

export async function GET(req: NextRequest) {
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

  const loginUrl = new URL("/admin/login", req.url)
  const response = NextResponse.redirect(loginUrl)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  })
  response.cookies.delete("admin_session")
  return response
}
