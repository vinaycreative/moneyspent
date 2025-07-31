import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type AccountInsert = TablesInsert<"accounts">
type AccountUpdate = TablesUpdate<"accounts">

// Query Keys
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters: { userId: string; isActive?: boolean; type?: string }) =>
    [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
}

// Get all accounts for a user
export function useAccounts(
  userId: string,
  options?: {
    isActive?: boolean
    type?: string
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: accountKeys.list({
      userId,
      isActive: options?.isActive,
      type: options?.type,
    }),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.isActive !== undefined) {
        params.append("isActive", options.isActive.toString())
      }
      if (options?.type) {
        params.append("type", options.type)
      }

      const response = await fetch(`/api/accounts?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      return data.accounts
    },
    enabled: options?.enabled !== false && !!userId,
  })
}

// Get a specific account
export function useAccount(id: string, enabled = true) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch account")
      }
      const data = await response.json()
      return data.account
    },
    enabled: enabled && !!id,
  })
}

// Create a new account
export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create account")
      }

      const data = await response.json()
      return data.account
    },
    onSuccess: (data) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })

      // Add the new account to the cache
      queryClient.setQueryData(accountKeys.detail(data.id), data)
    },
  })
}

// Update an account
export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: AccountUpdate & { id: string }) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update account")
      }

      const data = await response.json()
      return data.account
    },
    onSuccess: (data) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })

      // Update the specific account in cache
      queryClient.setQueryData(accountKeys.detail(data.id), data)
    },
  })
}

// Delete an account
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete account")
      }

      return id
    },
    onSuccess: (id) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })

      // Remove the account from cache
      queryClient.removeQueries({ queryKey: accountKeys.detail(id) })
    },
  })
}

// Update account balance
export function useUpdateAccountBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, balance }: { id: string; balance: number }) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update account balance")
      }

      const data = await response.json()
      return data.account
    },
    onSuccess: (data) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })

      // Update the specific account in cache
      queryClient.setQueryData(accountKeys.detail(data.id), data)
    },
  })
}
