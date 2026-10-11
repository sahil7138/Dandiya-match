import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("admin_session")?.value
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect attendee dashboard
  if (pathname.startsWith("/dashboard")) {
    const userSession = request.cookies.get("user_session")?.value
    if (!userSession) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
}
