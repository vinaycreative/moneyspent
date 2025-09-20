import { z } from "zod"
import api from "@/lib/axios"
import { 
  ApiResponseSchema,
  Category, 
  CategorySchema,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryWithStats,
  CategoryWithStatsSchema,
  PaginatedResponse,
  PaginatedResponseSchema 
} from "@/types"

// Fetch all categories for a user
export const fetchCategories = async (userId: string): Promise<Category[]> => {
  const response = await api.get(`/categories?user_id=${userId}`)
  
  const validatedResponse = ApiResponseSchema(
    z.array(CategorySchema)
  ).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch categories")
  }
  
  return validatedResponse.data
}

// Fetch single category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`)
  
  const validatedResponse = ApiResponseSchema(CategorySchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch category")
  }
  
  return validatedResponse.data
}

// Create new category
export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await api.post("/categories", data)
  
  const validatedResponse = ApiResponseSchema(CategorySchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to create category")
  }
  
  return validatedResponse.data
}

// Update existing category
export const updateCategory = async (
  id: string, 
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, data)
  
  const validatedResponse = ApiResponseSchema(CategorySchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to update category")
  }
  
  return validatedResponse.data
}

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  const response = await api.delete(`/categories/${id}`)
  
  const validatedResponse = ApiResponseSchema(z.object({}).optional()).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to delete category")
  }
}

// Fetch categories with transaction statistics
export const fetchCategoriesWithStats = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CategoryWithStats[]> => {
  const params = new URLSearchParams({ user_id: userId })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  
  const response = await api.get(`/categories/stats?${params.toString()}`)
  
  const validatedResponse = ApiResponseSchema(
    z.array(CategoryWithStatsSchema)
  ).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch category statistics")
  }
  
  return validatedResponse.data
}