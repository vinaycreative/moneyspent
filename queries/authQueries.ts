import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchLoggedInUser, signOut } from "@/api/auth"
import type { User } from "@/types"

// Query keys for consistent cache management
export const authQueryKeys = {
  user: ['auth', 'user'] as const,
}

// Fetch current logged-in user (simplified - backend handles token refresh)
export const useFetchLoggedInUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: fetchLoggedInUser,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors - user needs to login
      if (error?.response?.status === 401 || error?.message?.includes('Failed to fetch user')) {
        return false
      }
      return failureCount < 2
    },
    meta: {
      errorMessage: "Failed to fetch user information"
    }
  })
}

// Sign out mutation (simplified - backend handles everything)
export const useSignOut = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear all cached data on sign out
      queryClient.clear()
      // signOut function already handles redirect
    },
    onError: () => {
      // Even if logout fails, clear cache and redirect
      queryClient.clear()
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    },
    meta: {
      errorMessage: "Failed to sign out"
    }
  })
}
