import { useFetchLoggedInUser, useSignOut, useRefreshToken } from "@/queries/authQueries"
import type { User } from "@/types"

interface UseAuthReturn {
  user: User | undefined
  isLoading: boolean
  isError: boolean
  isAuthenticated: boolean
  signOut: () => void
  refreshToken: () => void
  error: Error | null
  // Derived values
  userName: string
  userInitials: string
  hasAvatar: boolean
}

// UI-ready auth hook with derived values and actions
export const useAuth = (): UseAuthReturn => {
  const { 
    data: user, 
    isLoading, 
    isError, 
    error 
  } = useFetchLoggedInUser()
  
  const signOutMutation = useSignOut()
  const refreshTokenMutation = useRefreshToken()
  
  // Derived values for UI components
  const userName = user?.name || "Unknown User"
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : "??"
  const hasAvatar = Boolean(user?.avatar)
  const isAuthenticated = Boolean(user && !isError)
  
  return {
    user,
    isLoading: isLoading || signOutMutation.isPending || refreshTokenMutation.isPending,
    isError: isError || signOutMutation.isError || refreshTokenMutation.isError,
    isAuthenticated,
    error: error || signOutMutation.error || refreshTokenMutation.error,
    
    // Actions
    signOut: () => signOutMutation.mutate(),
    refreshToken: () => refreshTokenMutation.mutate(),
    
    // Derived values for UI
    userName,
    userInitials,
    hasAvatar,
  }
}
