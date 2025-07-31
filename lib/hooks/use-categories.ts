import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type CategoryInsert = TablesInsert<"categories">
type CategoryUpdate = TablesUpdate<"categories">

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: { userId: string; type?: string }) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// Get all categories for a user
export function useCategories(
  userId: string,
  options?: {
    type?: string
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: categoryKeys.list({
      userId,
      type: options?.type,
    }),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.type) {
        params.append("type", options.type)
      }

      const response = await fetch(`/api/categories?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      return data.categories
    },
    enabled: options?.enabled !== false && !!userId,
  })
}

// Get a specific category
export function useCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/categories/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch category")
      }
      const data = await response.json()
      return data.category
    },
    enabled: enabled && !!id,
  })
}

// Create a new category
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create category")
      }

      const data = await response.json()
      return data.category
    },
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })

      // Add the new category to the cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data)
    },
  })
}

// Update a category
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update category")
      }

      const data = await response.json()
      return data.category
    },
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })

      // Update the specific category in cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data)
    },
  })
}

// Delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete category")
      }

      return id
    },
    onSuccess: (id) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })

      // Remove the category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) })
    },
  })
}

// Get expense categories only
export function useExpenseCategories(userId: string, enabled = true) {
  return useCategories(userId, { type: "expense", enabled })
}

// Get income categories only
export function useIncomeCategories(userId: string, enabled = true) {
  return useCategories(userId, { type: "income", enabled })
}
