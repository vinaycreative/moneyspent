import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  useFetchTransactions,
  useFetchTransactionById,
  useFetchTransactionsByCategory,
  useFetchTransactionSummary,
  useFetchTransactionTrend,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction
} from "@/queries/transactionQueries"
import { fetchTransactionsByCategory } from "@/api/transactions"
import type {
  Transaction,
  TransactionQueryParams,
  TransactionByCategoryParams,
  TransactionSummary,
  TransactionTrendItem,
  TransactionTrendParams,
} from "@/types"

// Main transactions hook with derived values
export const useTransactions = (params?: TransactionQueryParams, enabled = true) => {
  const { data: transactions, isLoading, isError, error } = useFetchTransactions(params, enabled)

  const derivedValues = useMemo(() => {
    const transactionList = Array.isArray(transactions) ? transactions : []

    // Calculate derived values
    const hasTransactions = transactionList.length > 0
    const totalAmount = transactionList.reduce((sum, tx) => sum + tx.amount, 0)
    const expenseTransactions = transactionList.filter((tx) => tx.type === "expense")
    const incomeTransactions = transactionList.filter((tx) => tx.type === "income")
    const transferTransactions = transactionList.filter((tx) => tx.type === "transfer")

    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalTransfers = transferTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    const transactionCount = transactionList.length
    const expenseCount = expenseTransactions.length
    const incomeCount = incomeTransactions.length
    const transferCount = transferTransactions.length

    return {
      transactions: transactionList,
      hasTransactions,
      totalAmount,
      expenseTransactions,
      incomeTransactions,
      transferTransactions,
      totalExpenses,
      totalIncome,
      totalTransfers,
      transactionCount,
      expenseCount,
      incomeCount,
      transferCount,
    }
  }, [transactions])

  return {
    ...derivedValues,
    isLoading,
    isError,
    error,
  }
}

// Single transaction hook
export const useTransaction = (id: string, enabled = true) => {
  const query = useFetchTransactionById(id, enabled)
  return {
    ...query,
    transaction: query.data,
  }
}

// Transactions by category hook
export const useTransactionsByCategory = (params: TransactionByCategoryParams, enabled = true) => {
  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useFetchTransactionsByCategory(params, enabled)

  const derivedValues = useMemo(() => {
    const transactionList = transactions || []
    const hasTransactions = transactionList.length > 0
    const totalAmount = transactionList.reduce((sum, tx) => sum + tx.amount, 0)
    const transactionCount = transactionList.length

    return {
      transactions: transactionList,
      hasTransactions,
      totalAmount,
      transactionCount,
    }
  }, [transactions])

  return {
    ...derivedValues,
    isLoading,
    isError,
    error,
  }
}

// Transaction summary hook (computed from existing data)
export const useTransactionSummary = (enabled = true) => {
  const { totalExpenses, totalIncome, transactionCount, isLoading, error } = useTransactions(
    {},
    enabled
  )

  const netSavings = totalIncome - totalExpenses

  return {
    data: {
      totalExpenses,
      totalIncome,
      netSavings,
      transactionCount,
    },
    isLoading,
    error,
  }
}

// Transaction trend hook
export const useTransactionTrend = (params?: TransactionTrendParams, enabled = true) => {
  const query = useFetchTransactionTrend(params, enabled)
  return {
    ...query,
    trend: query.data || [],
  }
}

// Category transactions hook - directly using React Query without going through other hooks
export function useCategoryTransactions({
  userId,
  category,
  dateRange = "month",
  customStartDate,
  customEndDate,
  enabled = true,
}: {
  userId: string
  category: string
  dateRange?: "all" | "today" | "week" | "month" | "year" | "custom"
  customStartDate?: string
  customEndDate?: string
  enabled?: boolean
}) {
  // Build the params object for the API call
  const params = {
    category,
    dateRange,
    customStartDate,
    customEndDate,
  }
  
  // Use React Query directly to avoid any hook confusion
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", "by-category", params],
    queryFn: async () => {
      return await fetchTransactionsByCategory(params)
    },
    enabled: enabled && !!userId && !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  return {
    data: data || [],
    isLoading,
    error,
  }
}

// Mutation hooks for direct use
export const useCreateTransactionMutation = () => useCreateTransaction()
export const useUpdateTransactionMutation = () => useUpdateTransaction()
export const useDeleteTransactionMutation = () => useDeleteTransaction()
