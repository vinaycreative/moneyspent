import { useFetchTransactions, useFetchTransactionsInfinite, useFetchTransactionById, useFetchTransactionAnalytics, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useBulkDeleteTransactions } from "@/queries/transactionQueries"
import type { Transaction, TransactionWithCategory, TransactionAnalytics, TransactionFilters } from "@/types"

export const useTransactions = (filters?: Partial<TransactionFilters>) => {
  const query = useFetchTransactions(filters)
  const hasTransactions = (query.data?.items?.length || 0) > 0
  
  return {
    ...query,
    transactions: query.data?.items || [],
    hasTransactions,
  }
}

export const useTransactionsInfinite = (filters?: Partial<TransactionFilters>) => {
  const query = useFetchTransactionsInfinite(filters)
  const transactions = query.data?.pages.flatMap(page => page.items) || []
  const hasMore = Boolean(query.hasNextPage)
  
  return {
    ...query,
    transactions,
    hasMore,
  }
}

export const useTransaction = (id: string) => {
  const query = useFetchTransactionById(id)
  return {
    ...query,
    transaction: query.data,
  }
}

export const useTransactionAnalytics = (
  userId: string,
  startDate?: string,
  endDate?: string,
  categoryId?: string
) => {
  const query = useFetchTransactionAnalytics(userId, startDate, endDate, categoryId)
  return {
    ...query,
    analytics: query.data,
  }
}

export const useCreateTransactionMutation = () => useCreateTransaction()
export const useUpdateTransactionMutation = () => useUpdateTransaction()
export const useDeleteTransactionMutation = () => useDeleteTransaction()
export const useBulkDeleteTransactionsMutation = () => useBulkDeleteTransactions()
