import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type AccountInsert = TablesInsert<"accounts">
type AccountUpdate = TablesUpdate<"accounts">

interface UseAccountsOptions {
  enabled?: boolean
}

interface UseAccountsFilters {
  isActive?: boolean
  type?: string
}

export function useAccounts(userId: string, options: UseAccountsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      const response = await fetch(`/api/accounts?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      // Return the accounts array from the response
      return data.accounts || []
    },
    enabled: enabled && !!userId,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountData: AccountInsert) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create account")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.user_id] })

      // Update the cache with the new account
      queryClient.setQueryData(["accounts", variables.user_id], (oldData: any) => {
        if (oldData) {
          return [...oldData, data.account]
        }
        return [data.account]
      })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AccountUpdate }) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update account")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ["accounts"] })

      // Update the cache with the updated account
      queryClient.setQueryData(["accounts"], (oldData: any) => {
        if (oldData) {
          return oldData.map((account: any) =>
            account.id === variables.id ? data.account : account
          )
        }
        return oldData
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete account")
      }

      return response.json()
    },
    onSuccess: (data, accountId) => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ["accounts"] })

      // Remove the deleted account from cache
      queryClient.setQueryData(["accounts"], (oldData: any) => {
        if (oldData) {
          return oldData.filter((account: any) => account.id !== accountId)
        }
        return oldData
      })
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
