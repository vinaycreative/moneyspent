import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type TransactionInsert = TablesInsert<"transactions">
type TransactionUpdate = TablesUpdate<"transactions">

interface UseTransactionsOptions {
  enabled?: boolean
}

export function useTransactions(userId: string, options: UseTransactionsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const data = await response.json()
      return data.transactions || []
    },
    enabled: enabled && !!userId,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: TransactionInsert) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create transaction")
      }

      return response.json()
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions", variables.user_id] })
      await queryClient.cancelQueries({ queryKey: ["accounts", variables.user_id] })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions", variables.user_id])
      const previousAccounts = queryClient.getQueryData(["accounts", variables.user_id])

      // Optimistically update transactions
      queryClient.setQueryData(["transactions", variables.user_id], (oldData: any) => {
        if (oldData) {
          return [...oldData, { ...variables, id: "temp-id", created_at: new Date().toISOString() }]
        }
        return [{ ...variables, id: "temp-id", created_at: new Date().toISOString() }]
      })

      // Optimistically update account balance
      if (variables.account_id) {
        queryClient.setQueryData(["accounts", variables.user_id], (oldData: any) => {
          if (oldData) {
            return oldData.map((account: any) => {
              if (account.id === variables.account_id) {
                const newBalance = variables.type === "income" 
                  ? (account.balance || 0) + (variables.amount || 0)
                  : (account.balance || 0) - (variables.amount || 0)
                return { ...account, balance: newBalance }
              }
              return account
            })
          }
          return oldData
        })
      }

      return { previousTransactions, previousAccounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(["transactions", variables.user_id], context.previousTransactions)
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", variables.user_id], context.previousAccounts)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionUpdate }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update transaction")
      }

      return response.json()
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] })
      await queryClient.cancelQueries({ queryKey: ["accounts", variables.data.user_id] })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions"])
      const previousAccounts = queryClient.getQueryData(["accounts", variables.data.user_id])

      // Optimistically update transactions
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        if (oldData) {
          return oldData.map((transaction: any) =>
            transaction.id === variables.id ? { ...transaction, ...variables.data } : transaction
          )
        }
        return oldData
      })

      return { previousTransactions, previousAccounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(["transactions"], context.previousTransactions)
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", variables.data.user_id], context.previousAccounts)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.data.user_id] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete transaction")
      }

      return response.json()
    },
    onMutate: async (transactionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] })
      await queryClient.cancelQueries({ queryKey: ["accounts"] })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions"])
      const previousAccounts = queryClient.getQueryData(["accounts"])

      // Optimistically remove transaction
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        if (oldData) {
          return oldData.filter((transaction: any) => transaction.id !== transactionId)
        }
        return oldData
      })

      return { previousTransactions, previousAccounts }
    },
    onError: (err, transactionId, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(["transactions"], context.previousTransactions)
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts"], context.previousAccounts)
      }
    },
    onSettled: (data, error, transactionId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useTransactionSummary(userId: string, options: UseTransactionsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["transactionSummary", userId],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/summary?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transaction summary")
      }
      const data = await response.json()
      return data.summary
    },
    enabled: enabled && !!userId,
  })
}

// Get monthly trend (using database function)
export function useMonthlyTrend(userId: string, monthsBack = 6, enabled = true) {
  return useQuery({
    queryKey: ["monthly-trend", userId, monthsBack],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append("monthsBack", monthsBack.toString())

      const response = await fetch(`/api/transactions/trend?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch monthly trend")
      }
      const data = await response.json()
      return data.trend
    },
    enabled: enabled && !!userId,
  })
}
