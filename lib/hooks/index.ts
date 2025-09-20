// Re-export all transaction hooks from the main hooks directory
export { 
  useTransactions, 
  useTransaction, 
  useTransactionsByCategory,
  useTransactionTrend,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} from "@/hooks/useTransactions"

// Re-export account hooks
export { 
  useAccounts, 
  useAccount, 
  useAccountsWithStats,
  useCreateAccountMutation,
  useUpdateAccountMutation as useUpdateAccount,
  useDeleteAccountMutation 
} from "@/hooks/useAccounts"

// Re-export category hooks
export { 
  useCategories, 
  useCategory, 
  useCategoriesWithStats,
  useCategoryForm,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from "@/hooks/useCategories"

import { useMemo } from "react"
import { useTransactions, useTransactionSummary as useTransactionSummaryBase } from "@/hooks/useTransactions"
import { useDeleteTransactionMutation, useUpdateTransactionMutation } from "@/hooks/useTransactions"
import moment from "moment-timezone"

// Custom filtered transactions hook
interface UseFilteredTransactionsParams {
  userId: string
  dateRange?: "today" | "week" | "month" | "year" | "custom" | "all"
  customStartDate?: string
  customEndDate?: string
  accountId?: string
  transactionType?: "expense" | "income" | "all"
  enabled?: boolean
}

export const useFilteredTransactions = (params: UseFilteredTransactionsParams) => {
  // Get date range filters
  const { startDate, endDate } = useMemo(() => {
    const now = moment()
    
    switch (params.dateRange) {
      case "today":
        return {
          startDate: now.startOf('day').toISOString(),
          endDate: now.endOf('day').toISOString()
        }
      case "week":
        return {
          startDate: now.startOf('week').toISOString(),
          endDate: now.endOf('week').toISOString()
        }
      case "month":
        return {
          startDate: now.startOf('month').toISOString(),
          endDate: now.endOf('month').toISOString()
        }
      case "year":
        return {
          startDate: now.startOf('year').toISOString(),
          endDate: now.endOf('year').toISOString()
        }
      case "custom":
        return {
          startDate: params.customStartDate ? moment(params.customStartDate).startOf('day').toISOString() : undefined,
          endDate: params.customEndDate ? moment(params.customEndDate).endOf('day').toISOString() : undefined
        }
      default:
        return { startDate: undefined, endDate: undefined }
    }
  }, [params.dateRange, params.customStartDate, params.customEndDate])

  // Build query parameters
  const queryParams = useMemo(() => ({
    userId: params.userId,
    startDate,
    endDate,
    accountId: params.accountId && params.accountId !== "all" ? params.accountId : undefined,
    type: params.transactionType && params.transactionType !== "all" ? params.transactionType : undefined,
  }), [params.userId, startDate, endDate, params.accountId, params.transactionType])

  const { transactions, isLoading, isError, error } = useTransactions(queryParams, params.enabled)

  // Calculate derived values
  const derivedValues = useMemo(() => {
    const expenses = transactions.filter(tx => tx.type === 'expense')
    const income = transactions.filter(tx => tx.type === 'income')
    
    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0)
    const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0)
    const netSavings = totalIncome - totalExpenses

    return {
      transactions,
      totalExpenses,
      totalIncome,
      netSavings,
    }
  }, [transactions])

  return {
    ...derivedValues,
    isLoading,
    isError,
    error,
  }
}

// Wrapper hooks for mutations to match expected API
export const useDeleteTransaction = () => {
  return useDeleteTransactionMutation()
}

export const useUpdateTransaction = () => {
  return useUpdateTransactionMutation()
}

// Wrapper for transaction summary to match expected API
export const useTransactionSummary = (userId: string, options?: { enabled?: boolean }) => {
  return useTransactionSummaryBase(undefined, undefined, options?.enabled)
}