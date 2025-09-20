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
} from "@/types"

// Fetch all transactions with filters
export const fetchTransactions = async (
  params?: TransactionQueryParams
): Promise<Transaction[]> => {
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

  // Simple response format: { success, message, data }
  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch transactions")
  }

  // API data is already in the correct format
  return apiResponse.data
}

// Fetch single transaction by ID
export const fetchTransactionById = async (id: string): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch transaction")
  }

  return apiResponse.data
}

// Create new transaction
export const createTransaction = async (data: CreateTransactionRequest): Promise<Transaction> => {
  const response = await api.post("/transactions", data)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to create transaction")
  }

  return apiResponse.data
}

// Update existing transaction
export const updateTransaction = async (
  id: string,
  data: UpdateTransactionRequest
): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}`, data)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to update transaction")
  }

  return apiResponse.data
}

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await api.delete(`/transactions/${id}`)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to delete transaction")
  }
}

// Fetch transactions by category
export const fetchTransactionsByCategory = async (
  params: TransactionByCategoryParams
): Promise<Transaction[]> => {
  const searchParams = new URLSearchParams()

  // Add the category parameter - this was missing!
  searchParams.append("category", params.category)
  if (params.dateRange) searchParams.append("dateRange", params.dateRange)
  if (params.customStartDate) searchParams.append("customStartDate", params.customStartDate)
  if (params.customEndDate) searchParams.append("customEndDate", params.customEndDate)

  const response = await api.get(`/transactions/by-category?${searchParams.toString()}`)
  
  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch transactions by category")
  }

  return apiResponse.data
}

// Fetch transaction summary
export const fetchTransactionSummary = async (
  startDate?: string,
  endDate?: string
): Promise<TransactionSummary> => {
  const searchParams = new URLSearchParams()

  if (startDate) searchParams.append("startDate", startDate)
  if (endDate) searchParams.append("endDate", endDate)

  const queryString = searchParams.toString()
  const url = queryString ? `/transactions/summary?${queryString}` : "/transactions/summary"

  const response = await api.get(url)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch transaction summary")
  }

  return apiResponse.data
}

// Fetch transaction trend
export const fetchTransactionTrend = async (
  params?: TransactionTrendParams
): Promise<TransactionTrendItem[]> => {
  const searchParams = new URLSearchParams()

  if (params?.monthsBack) searchParams.append("monthsBack", params.monthsBack.toString())

  const queryString = searchParams.toString()
  const url = queryString ? `/transactions/trend?${queryString}` : "/transactions/trend"

  const response = await api.get(url)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch transaction trend")
  }

  return apiResponse.data
}
