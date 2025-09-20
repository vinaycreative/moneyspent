import { useMemo } from "react"
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
import type {
  Transaction,
  TransactionQueryParams,
  TransactionByCategoryParams,
  TransactionSummary,
  TransactionTrendItem,
  TransactionTrendParams
} from "@/types"
import { transformApiTransaction } from "@/types/schemas/transaction.schema"

// Main transactions hook with derived values
export const useTransactions = (params?: TransactionQueryParams, enabled = true) => {
  const { data: apiTransactions, isLoading, isError, error } = useFetchTransactions(params, enabled)
  
  const derivedValues = useMemo(() => {
    // Transform API transactions to frontend transactions
    const transactions: Transaction[] = (apiTransactions || []).map(transformApiTransaction)
    
    // Calculate derived values
    const hasTransactions = transactions.length > 0
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const expenseTransactions = transactions.filter(tx => tx.type === 'expense')
    const incomeTransactions = transactions.filter(tx => tx.type === 'income')
    const transferTransactions = transactions.filter(tx => tx.type === 'transfer')
    
    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalTransfers = transferTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    const transactionCount = transactions.length
    const expenseCount = expenseTransactions.length
    const incomeCount = incomeTransactions.length
    const transferCount = transferTransactions.length
    
    return {
      transactions,
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
  }, [apiTransactions])
  
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
  const { data: apiTransactions, isLoading, isError, error } = useFetchTransactionsByCategory(params, enabled)
  
  const derivedValues = useMemo(() => {
    const transactions: Transaction[] = (apiTransactions || []).map(transformApiTransaction)
    const hasTransactions = transactions.length > 0
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const transactionCount = transactions.length
    
    return {
      transactions,
      hasTransactions,
      totalAmount,
      transactionCount,
    }
  }, [apiTransactions])
  
  return {
    ...derivedValues,
    isLoading,
    isError,
    error,
  }
}

// Transaction summary hook
export const useTransactionSummary = (startDate?: string, endDate?: string, enabled = true) => {
  const query = useFetchTransactionSummary(startDate, endDate, enabled)
  return {
    ...query,
    summary: query.data,
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

// Mutation hooks for direct use
export const useCreateTransactionMutation = () => useCreateTransaction()
export const useUpdateTransactionMutation = () => useUpdateTransaction()
export const useDeleteTransactionMutation = () => useDeleteTransaction()
