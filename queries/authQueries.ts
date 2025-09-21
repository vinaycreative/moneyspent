import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchLoggedInUser, signOut, refreshToken } from "@/api/auth"
import type { User } from "@/types"

// Query keys for consistent cache management
export const authQueryKeys = {
  user: ['auth', 'user'] as const,
  refreshToken: ['auth', 'refresh'] as const,
}

// Fetch current logged-in user
export const useFetchLoggedInUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: fetchLoggedInUser,
    enabled: options?.enabled ?? true, // Allow disabling the query
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
    meta: {
      errorMessage: "Failed to fetch user information"
    }
  })
}

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all cached data on sign out
      queryClient.clear()
      
      // Redirect to home if not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'
      }
    },
    meta: {
      errorMessage: "Failed to sign out"
    }
  })
}

// Refresh token mutation
export const useRefreshToken = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // Update cookie with new token using correct domain
      if (typeof window !== 'undefined') {
        const isProduction = process.env.NODE_ENV === 'production'
        const sameSite = isProduction ? 'none' : 'lax'
        const secure = isProduction ? '; secure' : ''
        const domain = isProduction ? '; domain=.moneyspend.app' : ''
        const expiryDate = new Date()
        expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000)) // 24 hours
        
        document.cookie = `access_token=${data.access_token}; expires=${expiryDate.toUTCString()}; path=/; samesite=${sameSite}${secure}${domain}`
      }
      
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user })
    },
    meta: {
      errorMessage: "Failed to refresh authentication token"
    }
  })
}
