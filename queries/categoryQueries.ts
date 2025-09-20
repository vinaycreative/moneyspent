import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategoriesWithStats,
  fetchCategoryTransactions
} from "@/api/categories"
import type { 
  Category, 
  CategoryWithStats,
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  GetCategoriesQuery,
  GetCategoryTransactionsQuery,
  CategoryTransaction
} from "@/types"

// Query keys for consistent cache management
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (userId: string, query?: GetCategoriesQuery) => [...categoryQueryKeys.lists(), userId, query] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
  stats: () => [...categoryQueryKeys.all, 'stats'] as const,
  statsForUser: (userId: string, startDate?: string, endDate?: string) => 
    [...categoryQueryKeys.stats(), userId, startDate, endDate] as const,
  transactions: () => [...categoryQueryKeys.all, 'transactions'] as const,
  categoryTransactions: (categoryId: string, query?: GetCategoryTransactionsQuery) => 
    [...categoryQueryKeys.transactions(), categoryId, query] as const,
}

// Fetch all categories for a user
export const useFetchCategories = (userId: string, query?: GetCategoriesQuery, enabled = true) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(userId, query),
    queryFn: () => fetchCategories(userId, query),
    enabled: !!userId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: "Failed to fetch categories"
    }
  })
}

// Fetch single category by ID
export const useFetchCategoryById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => fetchCategoryById(id),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: "Failed to fetch category details"
    }
  })
}

// Fetch category transactions
export const useFetchCategoryTransactions = (
  categoryId: string,
  query?: GetCategoryTransactionsQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: categoryQueryKeys.categoryTransactions(categoryId, query),
    queryFn: () => fetchCategoryTransactions(categoryId, query),
    enabled: !!categoryId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: "Failed to fetch category transactions"
    }
  })
}

// Fetch categories with transaction statistics
export const useFetchCategoriesWithStats = (
  userId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: categoryQueryKeys.statsForUser(userId, startDate, endDate),
    queryFn: () => fetchCategoriesWithStats(userId, startDate, endDate),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (stats change more frequently)
    meta: {
      errorMessage: "Failed to fetch category statistics"
    }
  })
}

// Create new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      // Invalidate all categories lists since we don't know which query filters were used
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.lists() 
      })
      
      // Invalidate stats as they may have changed
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
      })
      
      // Invalidate transactions as category creation may affect transaction data
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.transactions() 
      })
    },
    meta: {
      errorMessage: "Failed to create category"
    }
  })
}

// Update existing category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update specific category in cache
      queryClient.setQueryData(
        categoryQueryKeys.detail(updatedCategory.id),
        updatedCategory
      )
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.lists() 
      })
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
      })
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.transactions() 
      })
    },
    meta: {
      errorMessage: "Failed to update category"
    }
  })
}

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedId) => {
      // Remove specific category detail cache
      queryClient.removeQueries({ 
        queryKey: categoryQueryKeys.detail(deletedId) 
      })
      
      // Remove category transactions cache
      queryClient.removeQueries({ 
        queryKey: categoryQueryKeys.categoryTransactions(deletedId) 
      })
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.lists() 
      })
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
      })
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.transactions() 
      })
    },
    meta: {
      errorMessage: "Failed to delete category"
    }
  })
}