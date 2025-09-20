import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { 
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchTransactionAnalytics,
  bulkDeleteTransactions
} from "@/api/transactions"
import type { 
  Transaction,
  TransactionWithCategory,
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionAnalytics,
  PaginatedResponse
} from "@/types"

// Query keys for consistent cache management
export const transactionQueryKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionQueryKeys.all, 'list'] as const,
  list: (filters?: Partial<TransactionFilters>) => [...transactionQueryKeys.lists(), filters] as const,
  details: () => [...transactionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionQueryKeys.details(), id] as const,
  analytics: () => [...transactionQueryKeys.all, 'analytics'] as const,
  analyticsForUser: (userId: string, startDate?: string, endDate?: string, categoryId?: string) => 
    [...transactionQueryKeys.analytics(), userId, startDate, endDate, categoryId] as const,
}

// Fetch paginated transactions with filters
export const useFetchTransactions = (filters?: Partial<TransactionFilters>, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.list(filters),
    queryFn: () => fetchTransactions(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: "Failed to fetch transactions"
    }
  })
}

// Infinite query for transaction list (useful for pagination)
export const useFetchTransactionsInfinite = (filters?: Partial<TransactionFilters>) => {
  return useInfiniteQuery({
    queryKey: [...transactionQueryKeys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      fetchTransactions({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TransactionWithCategory>) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    getPreviousPageParam: (firstPage: PaginatedResponse<TransactionWithCategory>) => {
      return firstPage.page > 1 ? firstPage.page - 1 : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: "Failed to fetch transactions"
    }
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
      errorMessage: "Failed to fetch transaction details"
    }
  })
}

// Fetch transaction analytics
export const useFetchTransactionAnalytics = (
  userId: string,
  startDate?: string,
  endDate?: string,
  categoryId?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.analyticsForUser(userId, startDate, endDate, categoryId),
    queryFn: () => fetchTransactionAnalytics(userId, startDate, endDate, categoryId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: "Failed to fetch transaction analytics"
    }
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
        queryKey: transactionQueryKeys.lists() 
      })
      
      // Invalidate analytics as they may have changed
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.analytics() 
      })
      
      // Invalidate category stats if they exist
      queryClient.invalidateQueries({ 
        queryKey: ['categories', 'stats'] 
      })
    },
    meta: {
      errorMessage: "Failed to create transaction"
    }
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
      queryClient.setQueryData(
        transactionQueryKeys.detail(id),
        updatedTransaction
      )
      
      // Invalidate transactions list
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.lists() 
      })
      
      // Invalidate analytics
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.analytics() 
      })
      
      // Invalidate category stats
      queryClient.invalidateQueries({ 
        queryKey: ['categories', 'stats'] 
      })
    },
    meta: {
      errorMessage: "Failed to update transaction"
    }
  })
}

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: transactionQueryKeys.detail(deletedId) 
      })
      
      // Invalidate transactions list
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.lists() 
      })
      
      // Invalidate analytics
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.analytics() 
      })
      
      // Invalidate category stats
      queryClient.invalidateQueries({ 
        queryKey: ['categories', 'stats'] 
      })
    },
    meta: {
      errorMessage: "Failed to delete transaction"
    }
  })
}

// Bulk delete transactions
export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bulkDeleteTransactions,
    onSuccess: (_, deletedIds) => {
      // Remove multiple transactions from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ 
          queryKey: transactionQueryKeys.detail(id) 
        })
      })
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.lists() 
      })
      queryClient.invalidateQueries({ 
        queryKey: transactionQueryKeys.analytics() 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['categories', 'stats'] 
      })
    },
    meta: {
      errorMessage: "Failed to delete transactions"
    }
  })
}