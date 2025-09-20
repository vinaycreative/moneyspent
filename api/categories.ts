import { z } from "zod"
import api from "@/lib/axios"
import {
  ApiResponseSchema,
  Category,
  CategorySchema,
  ApiCategory,
  ApiCategorySchema,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryWithStats,
  CategoryWithStatsSchema,
  GetCategoriesQuery,
  GetCategoryTransactionsQuery,
  CategoryTransaction,
  CategoryTransactionSchema,
  transformApiCategory,
} from "@/types"

// Fetch all categories for a user
export const fetchCategories = async (
  userId: string,
  query?: GetCategoriesQuery
): Promise<Category[]> => {
  const params = new URLSearchParams()
  if (query?.kind) {
    params.append("kind", query.kind)
  }

  const url = params.toString() ? `/categories?${params.toString()}` : "/categories"
  const response = await api.get(url)

  // Parse the API response structure
  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse?.message || "Failed to fetch categories")
  }
  
  // Validate the categories array
  const validatedCategories = z.array(ApiCategorySchema).parse(apiResponse.data)
  
  // Transform API categories to frontend format
  return validatedCategories.map(transformApiCategory)
}

// Fetch single category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`)

  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse?.message || "Failed to fetch category")
  }
  
  const validatedCategory = ApiCategorySchema.parse(apiResponse.data)
  return transformApiCategory(validatedCategory)
}

// Create new category
export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await api.post("/categories", data)

  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse?.message || "Failed to create category")
  }
  
  const validatedCategory = ApiCategorySchema.parse(apiResponse.data)
  return transformApiCategory(validatedCategory)
}

// Update existing category
export const updateCategory = async (
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, data)

  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse?.message || "Failed to update category")
  }
  
  const validatedCategory = ApiCategorySchema.parse(apiResponse.data)
  return transformApiCategory(validatedCategory)
}

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  const response = await api.delete(`/categories/${id}`)

  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success) {
    throw new Error(apiResponse?.message || "Failed to delete category")
  }
}

// Fetch category transactions
export const fetchCategoryTransactions = async (
  categoryId: string,
  query?: GetCategoryTransactionsQuery
): Promise<CategoryTransaction[]> => {
  const params = new URLSearchParams()
  if (query?.dateRange) {
    params.append("dateRange", query.dateRange)
  }
  if (query?.customStartDate) {
    params.append("customStartDate", query.customStartDate)
  }
  if (query?.customEndDate) {
    params.append("customEndDate", query.customEndDate)
  }

  const url = params.toString()
    ? `/categories/${categoryId}/transactions?${params.toString()}`
    : `/categories/${categoryId}/transactions`
  const response = await api.get(url)

  const apiResponse = response.data
  
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse?.message || "Failed to fetch category transactions")
  }
  
  const validatedTransactions = z.array(CategoryTransactionSchema).parse(apiResponse.data)
  return validatedTransactions
}

// Fetch categories with transaction statistics
export const fetchCategoriesWithStats = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CategoryWithStats[]> => {
  const params = new URLSearchParams({ user_id: userId })
  if (startDate) params.append("start_date", startDate)
  if (endDate) params.append("end_date", endDate)

  const response = await api.get(`/categories/stats?${params.toString()}`)

  const validatedResponse = ApiResponseSchema(z.array(CategoryWithStatsSchema)).parse(
    response.data
  )

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch category statistics")
  }

  return validatedResponse.data
}
