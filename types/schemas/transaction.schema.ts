import { z } from "zod"

// Transaction type enum
export const TransactionTypeSchema = z.enum(["expense", "income", "transfer"])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

// Date range enum for filtering
export const DateRangeSchema = z.enum(["today", "week", "month", "year", "all", "custom"])
export type DateRange = z.infer<typeof DateRangeSchema>

// Related category and account schemas (simplified versions)
export const TransactionCategorySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    icon: z.string(),
    color: z.string().optional(),
    kind: TransactionTypeSchema.optional(),
  })
  .nullable()

export const TransactionAccountSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.string(),
  })
  .nullable()

// Raw API response schema (matches backend exactly)
export const ApiTransactionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  amount: z.number(),
  type: TransactionTypeSchema,
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  occurred_at: z.string().datetime(),
  currency: z.string().min(1).default("INR"),
  related_transfer_id: z.string().uuid().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  category: TransactionCategorySchema,
  account: TransactionAccountSchema,
})

export type ApiTransaction = z.infer<typeof ApiTransactionSchema>

// Frontend transaction schema (transformed for UI)
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  amount: z.number(),
  type: TransactionTypeSchema,
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  occurred_at: z.string().datetime(),
  currency: z.string().min(1).default("INR"),
  related_transfer_id: z.string().uuid().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  category: TransactionCategorySchema,
  account: TransactionAccountSchema,
})

export type Transaction = z.infer<typeof TransactionSchema>

// Create transaction request
export const CreateTransactionRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  type: TransactionTypeSchema,
  account_id: z.string().uuid("Valid account is required"),
  category_id: z.string().uuid().nullable().optional(),
  occurred_at: z.string().datetime(),
  currency: z.string().min(1).default("INR"),
})

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>

// Update transaction request
export const UpdateTransactionRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  type: TransactionTypeSchema.optional(),
  account_id: z.string().optional(),
  category_id: z.string().nullable().optional(),
  occurred_at: z.string().optional(),
  currency: z.string().min(1).optional(),
})

export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionRequestSchema>

// Transaction query filters
export const TransactionQueryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: TransactionTypeSchema.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100).optional(),
  offset: z.number().int().min(0).default(0).optional(),
})

export type TransactionQueryParams = z.infer<typeof TransactionQueryParamsSchema>

// Transaction by category query params
export const TransactionByCategoryParamsSchema = z.object({
  category: z.string().min(1),
  dateRange: DateRangeSchema.optional(),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
})

export type TransactionByCategoryParams = z.infer<typeof TransactionByCategoryParamsSchema>

// Transaction summary schema
export const TransactionSummarySchema = z.object({
  total_expenses: z.number(),
  total_income: z.number(),
  net_savings: z.number(),
})

export type TransactionSummary = z.infer<typeof TransactionSummarySchema>

// Transaction trend item schema
export const TransactionTrendItemSchema = z.object({
  month: z.string(),
  year: z.number(),
  total_expenses: z.number(),
  total_income: z.number(),
  net_savings: z.number(),
})

export type TransactionTrendItem = z.infer<typeof TransactionTrendItemSchema>

// Transaction trend query params
export const TransactionTrendParamsSchema = z.object({
  monthsBack: z.number().int().min(1).max(24).default(6).optional(),
})

export type TransactionTrendParams = z.infer<typeof TransactionTrendParamsSchema>

// Transformation function from API response to frontend transaction
export const transformApiTransaction = (apiTransaction: ApiTransaction): Transaction => {
  return {
    id: apiTransaction.id,
    title: apiTransaction.title,
    description: apiTransaction.description,
    amount: apiTransaction.amount,
    type: apiTransaction.type,
    account_id: apiTransaction.account_id,
    category_id: apiTransaction.category_id,
    occurred_at: apiTransaction.occurred_at,
    currency: apiTransaction.currency,
    related_transfer_id: apiTransaction.related_transfer_id,
    user_id: apiTransaction.user_id,
    created_at: apiTransaction.created_at,
    updated_at: apiTransaction.updated_at,
    category: apiTransaction.category,
    account: apiTransaction.account,
  }
}
