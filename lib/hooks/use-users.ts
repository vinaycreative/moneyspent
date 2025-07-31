import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase"

type User = Tables<"users">
type UserInsert = TablesInsert<"users">
type UserUpdate = TablesUpdate<"users">

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
}

// Get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        throw new Error(`Failed to get current user: ${error.message}`)
      }

      if (!user) {
        return null
      }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw new Error(`Failed to fetch user profile: ${profileError.message}`)
      }

      return profile || user
    },
  })
}

// Get user by ID
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

      if (error) {
        throw new Error(`Failed to fetch user: ${error.message}`)
      }

      return data
    },
    enabled: enabled && !!id,
  })
}

// Create user profile
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: UserInsert) => {
      const { data, error } = await supabase.from("users").insert(user).select().single()

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: userKeys.details() })

      // Add the new user to the cache
      queryClient.setQueryData(userKeys.detail(data.id), data)
    },
  })
}

// Update user profile
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...user }: UserUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: userKeys.details() })

      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(data.id), data)
    },
  })
}

// Update current user profile
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: Omit<UserUpdate, "id">) => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error("No authenticated user")
      }

      const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", currentUser.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: userKeys.details() })
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })

      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(data.id), data)
    },
  })
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(`Failed to sign out: ${error.message}`)
      }
    },
    onSuccess: () => {
      // Clear all queries when user signs out
      queryClient.clear()
    },
  })
}

// Get user session
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        throw new Error(`Failed to get session: ${error.message}`)
      }

      return session
    },
  })
}
