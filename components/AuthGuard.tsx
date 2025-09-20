"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authManager } from "@/lib/auth-manager"

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

        // Use the centralized auth manager for session validation
        const hasValidSession = await authManager.ensureValidSession()

        if (!hasValidSession) {
          console.log("AuthGuard: No valid session, redirecting to login")
          await authManager.clearAuthData()
          router.push("/")
          return
        }

        setIsChecking(false)
      } catch (error) {
        console.error("AuthGuard: Auth check failed:", error)
        await authManager.clearAuthData()
        router.push("/")
      }
    }

    checkAuth()
  }, [pathname, router])

  // This function is now handled by authManager.clearAuthData()
  // Keeping for backward compatibility but it just delegates
  // const clearStaleAuth = async () => {
  //   await authManager.clearAuthData()
  // }

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
