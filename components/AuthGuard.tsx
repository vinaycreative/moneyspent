"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're on a private route
        const isPrivateRoute =
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/transactions") ||
          pathname.startsWith("/analytics") ||
          pathname.startsWith("/accounts") ||
          pathname.startsWith("/settings")

        if (!isPrivateRoute) {
          setIsChecking(false)
          return
        }

        // Get current session from Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          await clearStaleAuth()
          router.push("/")
          return
        }

        if (!session?.user) {
          await clearStaleAuth()
          router.push("/")
          return
        }

        // Validate session is not expired
        const now = Math.floor(Date.now() / 1000)
        if (session.expires_at && session.expires_at < now) {
          await clearStaleAuth()
          router.push("/")
          return
        }

        // Additional validation: check if user exists in our database
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("id")
            .eq("id", session.user.id)
            .single()

          if (profileError || !userProfile) {
            await clearStaleAuth()
            router.push("/")
            return
          }
        } catch (profileError) {
          await clearStaleAuth()
          router.push("/")
          return
        }

        setIsChecking(false)
      } catch (error) {
        await clearStaleAuth()
        router.push("/")
      }
    }

    checkAuth()
  }, [pathname, router])

  const clearStaleAuth = async () => {
    try {
      // Clear Supabase session
      await supabase.auth.signOut()

      // Clear any local storage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Clear cookies (if any custom ones exist)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    } catch (error) {
      // Silent error handling for auth clearing
    }
  }

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If we're on a private route and no user, don't render children
  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/settings")

  if (isPrivateRoute && !user) {
    return null // Will redirect to home
  }

  return <>{children}</>
}
