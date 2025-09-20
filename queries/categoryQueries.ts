import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategoriesWithStats
} from "@/api/categories"
import type { 
  Category, 
  CategoryWithStats,
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from "@/types"

// Query keys for consistent cache management
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...categoryQueryKeys.lists(), userId] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
  stats: () => [...categoryQueryKeys.all, 'stats'] as const,
  statsForUser: (userId: string, startDate?: string, endDate?: string) => 
    [...categoryQueryKeys.stats(), userId, startDate, endDate] as const,
}

// Fetch all categories for a user
export const useFetchCategories = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(userId),
    queryFn: () => fetchCategories(userId),
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
      // Add to categories list cache
      queryClient.setQueryData<Category[]>(
        categoryQueryKeys.list(newCategory.user_id),
        (old = []) => [...old, newCategory]
      )
      
      // Invalidate categories list to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.lists() 
      })
      
      // Invalidate stats as they may have changed
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
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
      
      // Update category in lists cache
      queryClient.setQueryData<Category[]>(
        categoryQueryKeys.list(updatedCategory.user_id),
        (old = []) => old.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.lists() 
      })
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
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
      // Remove from all relevant caches
      queryClient.removeQueries({ 
        queryKey: categoryQueryKeys.detail(deletedId) 
      })
      
      // Update lists cache to remove deleted category
      queryClient.setQueriesData<Category[]>(
        { queryKey: categoryQueryKeys.lists() },
        (old = []) => old.filter(cat => cat.id !== deletedId)
      )
      
      // Invalidate stats as they may have changed
      queryClient.invalidateQueries({ 
        queryKey: categoryQueryKeys.stats() 
      })
    },
    meta: {
      errorMessage: "Failed to delete category"
    }
  })
}