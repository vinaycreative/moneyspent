import { z } from "zod"
import api from "@/lib/axios"
import {
  ApiResponseSchema,
  ApiTransaction,
  ApiTransactionSchema,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionByCategoryParams,
  TransactionSummary,
  TransactionSummarySchema,
  TransactionTrendItem,
  TransactionTrendItemSchema,
  TransactionTrendParams,
  transformApiTransaction,
} from "@/types"

// Fetch all transactions with filters
export const fetchTransactions = async (params?: TransactionQueryParams): Promise<ApiTransaction[]> => {
  const searchParams = new URLSearchParams()
  
  if (params?.startDate) searchParams.append("startDate", params.startDate)
  if (params?.endDate) searchParams.append("endDate", params.endDate)
  if (params?.type) searchParams.append("type", params.type)
  if (params?.accountId) searchParams.append("accountId", params.accountId)
  if (params?.categoryId) searchParams.append("categoryId", params.categoryId)
  if (params?.limit) searchParams.append("limit", params.limit.toString())
  if (params?.offset) searchParams.append("offset", params.offset.toString())

  const queryString = searchParams.toString()
  const url = queryString ? `/transactions?${queryString}` : "/transactions"
  
  const response = await api.get(url)

  const validatedResponse = ApiResponseSchema(z.array(ApiTransactionSchema)).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transactions")
  }

  return validatedResponse.data
}

// Fetch single transaction by ID
export const fetchTransactionById = async (id: string): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`)

  const validatedResponse = ApiResponseSchema(ApiTransactionSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transaction")
  }

  // Transform API transaction to frontend transaction
  return transformApiTransaction(validatedResponse.data)
}

// Create new transaction
export const createTransaction = async (data: CreateTransactionRequest): Promise<Transaction> => {
  const response = await api.post("/transactions", data)

  const validatedResponse = ApiResponseSchema(ApiTransactionSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to create transaction")
  }

  // Transform API transaction to frontend transaction
  return transformApiTransaction(validatedResponse.data)
}

// Update existing transaction
export const updateTransaction = async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}`, data)

  const validatedResponse = ApiResponseSchema(ApiTransactionSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to update transaction")
  }

  // Transform API transaction to frontend transaction
  return transformApiTransaction(validatedResponse.data)
}

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await api.delete(`/transactions/${id}`)

  const validatedResponse = ApiResponseSchema(z.object({}).optional()).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to delete transaction")
  }
}

// Fetch transactions by category
export const fetchTransactionsByCategory = async (params: TransactionByCategoryParams): Promise<ApiTransaction[]> => {
  const searchParams = new URLSearchParams()
  
  searchParams.append("category", params.category)
  if (params.dateRange) searchParams.append("dateRange", params.dateRange)
  if (params.customStartDate) searchParams.append("customStartDate", params.customStartDate)
  if (params.customEndDate) searchParams.append("customEndDate", params.customEndDate)

  const response = await api.get(`/transactions/by-category?${searchParams.toString()}`)

  const validatedResponse = ApiResponseSchema(z.array(ApiTransactionSchema)).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transactions by category")
  }

  return validatedResponse.data
}

// Fetch transaction summary
export const fetchTransactionSummary = async (startDate?: string, endDate?: string): Promise<TransactionSummary> => {
  const searchParams = new URLSearchParams()
  
  if (startDate) searchParams.append("startDate", startDate)
  if (endDate) searchParams.append("endDate", endDate)

  const queryString = searchParams.toString()
  const url = queryString ? `/transactions/summary?${queryString}` : "/transactions/summary"
  
  const response = await api.get(url)

  const validatedResponse = ApiResponseSchema(TransactionSummarySchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transaction summary")
  }

  return validatedResponse.data
}

// Fetch transaction trend
export const fetchTransactionTrend = async (params?: TransactionTrendParams): Promise<TransactionTrendItem[]> => {
  const searchParams = new URLSearchParams()
  
  if (params?.monthsBack) searchParams.append("monthsBack", params.monthsBack.toString())

  const queryString = searchParams.toString()
  const url = queryString ? `/transactions/trend?${queryString}` : "/transactions/trend"
  
  const response = await api.get(url)

  const validatedResponse = ApiResponseSchema(z.array(TransactionTrendItemSchema)).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch transaction trend")
  }

  return validatedResponse.data
}
