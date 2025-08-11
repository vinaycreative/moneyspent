import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  list: (userId: string) => [...transactionKeys.all, userId] as const,
  summary: (userId: string) => ["transactionSummary", userId] as const,
}

type TransactionInsert = TablesInsert<"transactions">
type TransactionUpdate = TablesUpdate<"transactions">

interface UseTransactionsOptions {
  enabled?: boolean
}

export function useTransactions(userId: string, options: UseTransactionsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: transactionKeys.list(userId),
    queryFn: async () => {
      const response = await fetch(`/api/transactions?userId=${userId}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      })
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
          "Cache-Control": "no-store",
        },
        body: JSON.stringify(transactionData),
        cache: "no-store",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create transaction")
      }

      return response.json()
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.list(variables.user_id || "") })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(transactionKeys.list(variables.user_id || ""))

      // Optimistically update transactions
      queryClient.setQueryData(transactionKeys.list(variables.user_id || ""), (oldData: any) => {
        if (oldData) {
          return [
            { ...variables, id: "temp-id", created_at: new Date().toISOString() },
            ...oldData,
          ]
        }
        return [{ ...variables, id: "temp-id", created_at: new Date().toISOString() }]
      })

      return { previousTransactions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionKeys.list(variables.user_id || ""), context.previousTransactions)
      }
    },
    onSuccess: (data, variables) => {
      // Replace temp item with actual returned transaction at the top
      const returned = data.transaction
      if (returned) {
        queryClient.setQueryData(transactionKeys.list(variables.user_id || ""), (oldData: any) => {
          if (!oldData) return [returned]
          return [returned, ...oldData.filter((t: any) => t.id !== "temp-id")] // ensure unique
        })
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch related queries to ensure server truth
      queryClient.invalidateQueries({ queryKey: transactionKeys.list(variables.user_id || ""), refetchType: "active" })
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.user_id] })
      queryClient.invalidateQueries({ queryKey: transactionKeys.summary(variables.user_id || "" ) })
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
          "Cache-Control": "no-store",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update transaction")
      }

      return response.json()
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.all })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(transactionKeys.all)

      // Optimistically update transactions
      queryClient.setQueryData(transactionKeys.all, (oldData: any) => {
        if (oldData) {
          return oldData.map((transaction: any) =>
            transaction.id === variables.id ? { ...transaction, ...variables.data } : transaction
          )
        }
        return oldData
      })

      return { previousTransactions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionKeys.all, context.previousTransactions)
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["accounts", variables.data.user_id] })
      queryClient.invalidateQueries({ queryKey: transactionKeys.summary(variables.data.user_id || "") })
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
        headers: { "Cache-Control": "no-store" },
        cache: "no-store",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete transaction")
      }

      return response.json()
    },
    onMutate: async (transactionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.all })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(transactionKeys.all)

      // Optimistically remove transaction
      queryClient.setQueryData(transactionKeys.all, (oldData: any) => {
        if (oldData) {
          return oldData.filter((transaction: any) => transaction.id !== transactionId)
        }
        return oldData
      })

      return { previousTransactions }
    },
    onError: (err, transactionId, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionKeys.all, context.previousTransactions)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useTransactionSummary(userId: string, options: UseTransactionsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: transactionKeys.summary(userId),
    queryFn: async () => {
      const response = await fetch(`/api/transactions/summary?userId=${userId}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      })
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

      const response = await fetch(`/api/transactions/trend?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch monthly trend")
      }
      const data = await response.json()
      return data.trend
    },
    enabled: enabled && !!userId,
  })
}
