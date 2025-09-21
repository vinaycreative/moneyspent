import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  let next = searchParams.get("next") ?? "/dashboard"

  if (!next.startsWith("/")) next = "/dashboard"
  if (!code) return NextResponse.redirect(`${origin}/auth/auth-code-error`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.session?.access_token) {
    console.error("❌ Auth failed:", error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  // ✅ Set stable cookie for backend with correct domain
  const res = NextResponse.redirect(`${origin}${next}`)
  res.cookies.set("access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".moneyspend.app" : undefined,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return res
}
