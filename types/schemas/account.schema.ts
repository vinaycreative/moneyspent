import { z } from "zod"

// Account type enum - updated to match API exactly
export const AccountTypeSchema = z.enum([
  "cash",
  "bank",
  "credit",
  "wallet",
  "savings",
  "investment",
])
export type AccountType = z.infer<typeof AccountTypeSchema>

// Raw API response schema (matches backend exactly)
export const ApiAccountSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string().min(1),
  type: z.string(),
  currency: z.string(),
  starting_balance: z.number(),
  current_balance: z.number(),
  is_archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
// {
//   "id": "910f56fa-d9fb-47aa-bbed-b25379aaaf3f",
//   "user_id": "ff6c85be-2bd1-4881-841e-1ebb89725595",
//   "name": "My Savings Account",
//   "type": "savings",
//   "currency": "INR",
//   "starting_balance": 1000,
//   "current_balance": 1000,
//   "is_archived": false,
//   "created_at": "2025-09-16T16:34:30.584738+00:00",
//   "updated_at": "2025-09-16T16:34:30.584738+00:00"
// }

export type ApiAccount = z.infer<typeof ApiAccountSchema>

// Frontend account schema (transformed for UI)
export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.string(),
  balance: z.number(),
  currency: z.string().length(3).default("INR"),
  is_active: z.boolean().default(true),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Optional fields for backward compatibility
  account_number: z.string().optional(),
})

export type Account = z.infer<typeof AccountSchema>

// Create account request
export const CreateAccountRequestSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: AccountTypeSchema,
  starting_balance: z.number().default(0),
  currency: z.string().min(1).default("INR"),
})

export type CreateAccountRequest = z.infer<typeof CreateAccountRequestSchema>

// Update account request
export const UpdateAccountRequestSchema = z.object({
  name: z.string().min(1).optional(),
  current_balance: z.number().optional(),
  is_archived: z.boolean().optional(),
})

export type UpdateAccountRequest = z.infer<typeof UpdateAccountRequestSchema>

// Account with transaction stats
export const AccountWithStatsSchema = AccountSchema.extend({
  transaction_count: z.number().int().min(0),
  last_transaction_date: z.string().datetime().nullable(),
})

export type AccountWithStats = z.infer<typeof AccountWithStatsSchema>

// Transformation function from API response to frontend account
export const transformApiAccount = (apiAccount: ApiAccount): Account => {
  return {
    id: apiAccount.id,
    name: apiAccount.name,
    type: apiAccount.type,
    balance: apiAccount.current_balance,
    currency: apiAccount.currency,
    is_active: !apiAccount.is_archived, // Inverse logic
    user_id: apiAccount.user_id,
    created_at: apiAccount.created_at,
    updated_at: apiAccount.updated_at,
    // Add account_number as optional field if needed
    account_number: undefined,
  }
}
