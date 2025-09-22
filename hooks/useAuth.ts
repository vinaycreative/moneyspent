import { useFetchLoggedInUser, useSignOut } from "@/queries/authQueries"
import type { User } from "@/types"

interface UseAuthReturn {
  user: User | undefined
  isLoading: boolean
  isError: boolean
  isAuthenticated: boolean
  signOut: () => void
  error: Error | null
  // Derived values
  userName: string
  userInitials: string
  hasAvatar: boolean
}

// Simplified auth hook - backend handles all complexity
export const useAuth = (options?: { enabled?: boolean }): UseAuthReturn => {
  const { 
    data: user, 
    isLoading, 
    isError, 
    error 
  } = useFetchLoggedInUser(options)
  
  const signOutMutation = useSignOut()
  
  // Derived values for UI components
  const userName = user?.name || "Unknown User"
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : "??"
  const hasAvatar = Boolean(user?.avatar_url)
  const isAuthenticated = Boolean(user && !isError)
  
  return {
    user,
    isLoading: isLoading || signOutMutation.isPending,
    isError: isError || signOutMutation.isError,
    isAuthenticated,
    error: error || signOutMutation.error,
    
    // Actions
    signOut: () => signOutMutation.mutate(),
    
    // Derived values for UI
    userName,
    userInitials,
    hasAvatar,
  }
}
