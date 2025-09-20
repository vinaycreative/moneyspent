import { z } from "zod"
import api from "@/lib/axios"
import { 
  ApiResponseSchema,
  Transaction,
  TransactionSchema,
  TransactionWithCategory,
  TransactionWithCategorySchema,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionAnalytics,
  TransactionAnalyticsSchema,
  PaginatedResponse,
  PaginatedResponseSchema
} from "@/types"

// Fetch paginated transactions with optional filters
export const fetchTransactions = async (
  filters?: Partial<TransactionFilters>
): Promise<PaginatedResponse<TransactionWithCategory>> => {
  const params = new URLSearchParams()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
  }
  
  const response = await api.get(`/transactions?${params.toString()}`)
  
  const validatedResponse = ApiResponseSchema(
    PaginatedResponseSchema(TransactionWithCategorySchema)
  ).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transactions")
  }
  
  return validatedResponse.data
}

// Fetch single transaction by ID
export const fetchTransactionById = async (id: string): Promise<TransactionWithCategory> => {
  const response = await api.get(`/transactions/${id}`)
  
  const validatedResponse = ApiResponseSchema(TransactionWithCategorySchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transaction")
  }
  
  return validatedResponse.data
}

// Create new transaction
export const createTransaction = async (data: CreateTransactionRequest): Promise<Transaction> => {
  const response = await api.post("/transactions", data)
  
  const validatedResponse = ApiResponseSchema(TransactionSchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to create transaction")
  }
  
  return validatedResponse.data
}

// Update existing transaction
export const updateTransaction = async (
  id: string, 
  data: UpdateTransactionRequest
): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}`, data)
  
  const validatedResponse = ApiResponseSchema(TransactionSchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to update transaction")
  }
  
  return validatedResponse.data
}

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await api.delete(`/transactions/${id}`)
  
  const validatedResponse = ApiResponseSchema(z.object({}).optional()).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to delete transaction")
  }
}

// Fetch transaction analytics
export const fetchTransactionAnalytics = async (
  userId: string,
  startDate?: string,
  endDate?: string,
  categoryId?: string
): Promise<TransactionAnalytics> => {
  const params = new URLSearchParams({ user_id: userId })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (categoryId) params.append('category_id', categoryId)
  
  const response = await api.get(`/transactions/analytics?${params.toString()}`)
  
  const validatedResponse = ApiResponseSchema(TransactionAnalyticsSchema).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transaction analytics")
  }
  
  return validatedResponse.data
}

// Bulk delete transactions
export const bulkDeleteTransactions = async (ids: string[]): Promise<void> => {
  const response = await api.delete("/transactions/bulk", { data: { ids } })
  
  const validatedResponse = ApiResponseSchema(
    z.object({ deleted_count: z.number() })
  ).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to delete transactions")
  }
}