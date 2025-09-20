import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchTransactionsByCategory,
  fetchTransactionSummary,
  fetchTransactionTrend,
} from "@/api/transactions"
import type {
  Transaction,
  ApiTransaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionByCategoryParams,
  TransactionSummary,
  TransactionTrendItem,
  TransactionTrendParams,
} from "@/types"

// Query keys for consistent cache management
export const transactionQueryKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionQueryKeys.all, "list"] as const,
  list: (params?: TransactionQueryParams) => [...transactionQueryKeys.lists(), params] as const,
  details: () => [...transactionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionQueryKeys.details(), id] as const,
  byCategory: () => [...transactionQueryKeys.all, "by-category"] as const,
  byCategoryParams: (params: TransactionByCategoryParams) =>
    [...transactionQueryKeys.byCategory(), params] as const,
  summary: () => [...transactionQueryKeys.all, "summary"] as const,
  summaryWithDates: (startDate?: string, endDate?: string) =>
    [...transactionQueryKeys.summary(), startDate, endDate] as const,
  trend: () => [...transactionQueryKeys.all, "trend"] as const,
  trendWithParams: (params?: TransactionTrendParams) =>
    [...transactionQueryKeys.trend(), params] as const,
}

// Fetch transactions with filters
export const useFetchTransactions = (params?: TransactionQueryParams, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.list(params),
    queryFn: () => fetchTransactions(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: "Failed to fetch transactions",
    },
  })
}

// Fetch single transaction by ID
export const useFetchTransactionById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.detail(id),
    queryFn: () => fetchTransactionById(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: "Failed to fetch transaction details",
    },
  })
}

// Fetch transactions by category
export const useFetchTransactionsByCategory = (
  params: TransactionByCategoryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.byCategoryParams(params),
    queryFn: () => fetchTransactionsByCategory(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: "Failed to fetch transactions by category",
    },
  })
}

// Fetch transaction summary
export const useFetchTransactionSummary = (
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.summaryWithDates(startDate, endDate),
    queryFn: () => fetchTransactionSummary(startDate, endDate),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: "Failed to fetch transaction summary",
    },
  })
}

// Fetch transaction trend
export const useFetchTransactionTrend = (params?: TransactionTrendParams, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.trendWithParams(params),
    queryFn: () => fetchTransactionTrend(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (trends change less frequently)
    meta: {
      errorMessage: "Failed to fetch transaction trend",
    },
  })
}

// Create new transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction) => {
      // Invalidate transactions list to refetch with new data
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.lists(),
      })

      // Invalidate summary and trend data
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.summary(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.trend(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.byCategory(),
      })

      // Invalidate account-related queries since balances changed
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })

      // Invalidate category stats if they exist
      queryClient.invalidateQueries({
        queryKey: ["categories", "stats"],
      })

      // Invalidate analytics data since transaction data changed
      queryClient.invalidateQueries({
        queryKey: ["analytics"],
      })
    },
    meta: {
      errorMessage: "Failed to create transaction",
    },
  })
}

// Update existing transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      updateTransaction(id, data),
    onSuccess: (updatedTransaction, { id }) => {
      // Update specific transaction in cache
      queryClient.setQueryData(transactionQueryKeys.detail(id), updatedTransaction)

      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.lists(),
      })

      // Invalidate summary and trend data
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.summary(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.trend(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.byCategory(),
      })

      // Invalidate account-related queries since balances may have changed
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })

      // Invalidate category stats
      queryClient.invalidateQueries({
        queryKey: ["categories", "stats"],
      })

      // Invalidate analytics data since transaction data changed
      queryClient.invalidateQueries({
        queryKey: ["analytics"],
      })
    },
    meta: {
      errorMessage: "Failed to update transaction",
    },
  })
}

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.lists(),
      })
      
      // Invalidate summary and trend data
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.summary(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.trend(),
      })
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.byCategory(),
      })
      
      // Invalidate account-related queries since balances changed
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
      
      // Invalidate category stats
      queryClient.invalidateQueries({
        queryKey: ["categories", "stats"],
      })
      
      // Invalidate analytics data since transaction data changed
      queryClient.invalidateQueries({
        queryKey: ["analytics"],
      })
    },
    meta: {
      errorMessage: "Failed to delete transaction",
    },
  })
}
