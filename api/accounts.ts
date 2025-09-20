import { z } from "zod"
import api from "@/lib/axios"
import {
  Account,
  AccountWithStats,
  AccountWithStatsSchema,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "@/types"

// Fetch all accounts for a user (user_id extracted from token)
export const fetchAccounts = async (userId: string) => {
  const response = await api.get(`/accounts`)
  
  const apiResponse = response.data
  
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch accounts")
  }

  // API data is already in the correct format
  return apiResponse.data
}

// Fetch single account by ID
export const fetchAccountById = async (id: string): Promise<Account> => {
  const response = await api.get(`/accounts/${id}`)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch account")
  }

  return apiResponse.data
}

// Create new account
export const createAccount = async (data: CreateAccountRequest): Promise<Account> => {
  const response = await api.post("/accounts", data)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to create account")
  }

  return apiResponse.data
}

// Update existing account
export const updateAccount = async (id: string, data: UpdateAccountRequest): Promise<Account> => {
  const response = await api.put(`/accounts/${id}`, data)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to update account")
  }

  return apiResponse.data
}

// Delete account
export const deleteAccount = async (id: string): Promise<void> => {
  const response = await api.delete(`/accounts/${id}`)
  
  const apiResponse = response.data
  
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to delete account")
  }
}

// Fetch accounts with transaction statistics
export const fetchAccountsWithStats = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<AccountWithStats[]> => {
  const params = new URLSearchParams({ user_id: userId })
  if (startDate) params.append("start_date", startDate)
  if (endDate) params.append("end_date", endDate)

  const response = await api.get(`/accounts/stats?${params.toString()}`)

  const apiResponse = response.data

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch account statistics")
  }

  return apiResponse.data
}
