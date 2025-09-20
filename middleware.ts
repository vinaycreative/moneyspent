import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  // Skip auth callback routes
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next()
  }

  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/settings")

  // For private routes, we need more sophisticated auth checking
  if (isPrivateRoute) {
    // Basic token presence check
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // For server-side, we'll do a more thorough check using Supabase
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // If no session or error, redirect to login
      if (error || !session) {
        const response = NextResponse.redirect(new URL("/", request.url))
        // Clear the stale token
        response.cookies.set('access_token', '', {
          expires: new Date(0),
          path: '/'
        })
        return response
      }

      // Check if token is expired or expiring soon (within 5 minutes)
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      const bufferTime = 5 * 60 // 5 minutes buffer
      
      if (expiresAt <= (now + bufferTime)) {
        console.log('Token expiring soon, allowing request but client will handle refresh')
        // Let the request through - client-side auth manager will handle the refresh
        // We add a header to indicate the token needs refresh
        const response = NextResponse.next()
        response.headers.set('X-Token-Refresh-Needed', 'true')
        return response
      }
    } catch (error) {
      console.error('Middleware auth check failed:', error)
      // On error, let the client handle it
      return NextResponse.next()
    }
  }

  // If signed in and at root, redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
