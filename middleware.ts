import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  // // skip auth callback itself
  // if (pathname.startsWith("/auth/callback")) {
  //   return NextResponse.next()
  // }

  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/settings")

  // protect private routes
  if (!token && isPrivateRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // if signed in and at root, redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
