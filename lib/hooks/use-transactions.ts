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
    onSuccess: (data, variables) => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })

      // Update the cache with the new transaction
      queryClient.setQueryData(["transactions", variables.user_id], (oldData: any) => {
        if (oldData) {
          return [...oldData, data.transaction]
        }
        return [data.transaction]
      })
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
    onSuccess: (data, variables) => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })

      // Update the cache with the updated transaction
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        if (oldData) {
          return oldData.map((transaction: any) =>
            transaction.id === variables.id ? data.transaction : transaction
          )
        }
        return oldData
      })
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
    onSuccess: (data, transactionId) => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })

      // Remove the deleted transaction from cache
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        if (oldData) {
          return oldData.filter((transaction: any) => transaction.id !== transactionId)
        }
        return oldData
      })
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
