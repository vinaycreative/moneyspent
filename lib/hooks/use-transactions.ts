import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type TransactionInsert = TablesInsert<"transactions">
type TransactionUpdate = TablesUpdate<"transactions">

// Query Keys
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: { userId: string; startDate?: string; endDate?: string; type?: string }) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
}

// Get all transactions for a user
export function useTransactions(
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    type?: string
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: transactionKeys.list({
      userId,
      startDate: options?.startDate,
      endDate: options?.endDate,
      type: options?.type,
    }),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.startDate) {
        params.append("startDate", options.startDate)
      }
      if (options?.endDate) {
        params.append("endDate", options.endDate)
      }
      if (options?.type) {
        params.append("type", options.type)
      }

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const data = await response.json()
      return data.transactions
    },
    enabled: options?.enabled !== false && !!userId,
  })
}

// Get a specific transaction
export function useTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transaction")
      }
      const data = await response.json()
      return data.transaction
    },
    enabled: enabled && !!id,
  })
}

// Create a new transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create transaction")
      }

      const data = await response.json()
      return data.transaction
    },
    onSuccess: (data) => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })

      // Add the new transaction to the cache
      queryClient.setQueryData(transactionKeys.detail(data.id), data)
    },
  })
}

// Update a transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TransactionUpdate & { id: string }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update transaction")
      }

      const data = await response.json()
      return data.transaction
    },
    onSuccess: (data) => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })

      // Update the specific transaction in cache
      queryClient.setQueryData(transactionKeys.detail(data.id), data)
    },
  })
}

// Delete a transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete transaction")
      }

      return id
    },
    onSuccess: (id) => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })

      // Remove the transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) })
    },
  })
}

// Get transaction summary (using database function)
export function useTransactionSummary(
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ["transaction-summary", userId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.startDate) {
        params.append("startDate", options.startDate)
      }
      if (options?.endDate) {
        params.append("endDate", options.endDate)
      }

      const response = await fetch(`/api/transactions/summary?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch transaction summary")
      }
      const data = await response.json()
      return data.summary
    },
    enabled: options?.enabled !== false && !!userId,
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
