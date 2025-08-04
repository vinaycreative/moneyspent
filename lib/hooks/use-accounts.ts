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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["accounts", variables.user_id] })

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(["accounts", variables.user_id])

      // Optimistically update accounts
      queryClient.setQueryData(["accounts", variables.user_id], (oldData: any) => {
        if (oldData) {
          return [...oldData, { ...variables, id: "temp-id", created_at: new Date().toISOString() }]
        }
        return [{ ...variables, id: "temp-id", created_at: new Date().toISOString() }]
      })

      return { previousAccounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", variables.user_id], context.previousAccounts)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.user_id] })
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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["accounts", variables.data.user_id] })

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(["accounts", variables.data.user_id])

      // Optimistically update accounts
      queryClient.setQueryData(["accounts", variables.data.user_id], (oldData: any) => {
        if (oldData) {
          return oldData.map((account: any) =>
            account.id === variables.id ? { ...account, ...variables.data } : account
          )
        }
        return oldData
      })

      return { previousAccounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", variables.data.user_id], context.previousAccounts)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.data.user_id] })
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
    onMutate: async (accountId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["accounts"] })

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(["accounts"])

      // Optimistically remove account
      queryClient.setQueryData(["accounts"], (oldData: any) => {
        if (oldData) {
          return oldData.filter((account: any) => account.id !== accountId)
        }
        return oldData
      })

      return { previousAccounts }
    },
    onError: (err, accountId, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts"], context.previousAccounts)
      }
    },
    onSettled: (data, error, accountId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["accounts"] })

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(["accounts"])

      // Optimistically update account balance
      queryClient.setQueryData(["accounts"], (oldData: any) => {
        if (oldData) {
          return oldData.map((account: any) =>
            account.id === variables.id ? { ...account, balance: variables.balance } : account
          )
        }
        return oldData
      })

      return { previousAccounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts"], context.previousAccounts)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })
}
