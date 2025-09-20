import { z } from "zod"
import api from "@/lib/axios"
import {
  ApiResponseSchema,
  Account,
  AccountSchema,
  ApiAccount,
  ApiAccountSchema,
  transformApiAccount,
  AccountWithStats,
  AccountWithStatsSchema,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "@/types"

// Fetch all accounts for a user (user_id extracted from token)
export const fetchAccounts = async (userId: string) => {
  const response = await api.get(`/accounts`)
  console.log("response: ", response.data)
  const validatedResponse = ApiResponseSchema(z.array(ApiAccountSchema)).parse(response.data)

  console.log("validatedResponse: ", validatedResponse)
  // Transform API accounts to frontend accounts
  return validatedResponse.data
}

// Fetch single account by ID
export const fetchAccountById = async (id: string): Promise<Account> => {
  const response = await api.get(`/accounts/${id}`)

  const validatedResponse = ApiResponseSchema(ApiAccountSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch account")
  }

  // Transform API account to frontend account
  return transformApiAccount(validatedResponse.data)
}

// Create new account
export const createAccount = async (data: CreateAccountRequest): Promise<Account> => {
  const response = await api.post("/accounts", data)

  const validatedResponse = ApiResponseSchema(ApiAccountSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to create account")
  }

  // Transform API account to frontend account
  return transformApiAccount(validatedResponse.data)
}

// Update existing account
export const updateAccount = async (id: string, data: UpdateAccountRequest): Promise<Account> => {
  const response = await api.put(`/accounts/${id}`, data)

  const validatedResponse = ApiResponseSchema(ApiAccountSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to update account")
  }

  // Transform API account to frontend account
  return transformApiAccount(validatedResponse.data)
}

// Delete account
export const deleteAccount = async (id: string): Promise<void> => {
  const response = await api.delete(`/accounts/${id}`)
  console.log("response: ", response.data)
  return response.data.data
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

  const validatedResponse = ApiResponseSchema(z.array(AccountWithStatsSchema)).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch account statistics")
  }

  return validatedResponse.data
}
