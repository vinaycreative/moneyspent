"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { UserService } from "@/lib/services/user-service"
import { useCurrentUser, useSignOut } from "@/lib/hooks"
import { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  profile: any
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use TanStack Query hooks
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const signOutMutation = useSignOut()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          // Get user profile from database
          try {
            const userProfile = await UserService.getUserById(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error("Failed to get user profile:", error)
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null)

            if (session?.user) {
              try {
                const userProfile = await UserService.getUserById(session.user.id)
                setProfile(userProfile)
              } catch (error) {
                console.error("Failed to get user profile on auth change:", error)
              }
            } else {
              setProfile(null)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Update profile when currentUser changes (from TanStack Query)
  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser)
    }
  }, [currentUser])

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const refreshUser = async () => {
    try {
      if (user) {
        const userProfile = await UserService.getUserById(user.id)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading: isLoading || userLoading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 