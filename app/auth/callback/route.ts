import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/dashboard"
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/dashboard"
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        // Create or update user profile via API route
        const userData = {
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        }

        const response = await fetch(`${origin}/api/auth/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          console.error("Failed to create user profile via API")
        }

        // Simplified redirect logic for production
        const redirectUrl = `${origin}${next}`
        return NextResponse.redirect(redirectUrl)
      } catch (userError) {
        console.error("Failed to create/update user profile:", userError)
        // Even if user profile creation fails, redirect to dashboard
        // The user can still use the app, but some features might be limited
        const redirectUrl = `${origin}${next}`
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
