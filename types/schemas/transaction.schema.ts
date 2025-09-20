import { z } from "zod"
import { CategorySchema } from "./category.schema"

// Transaction schema
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1),
  date: z.string().datetime(),
  category_id: z.string().uuid(),
  account_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Transaction = z.infer<typeof TransactionSchema>

// Transaction with category details
export const TransactionWithCategorySchema = TransactionSchema.extend({
  category: CategorySchema,
})

export type TransactionWithCategory = z.infer<typeof TransactionWithCategorySchema>

// Create transaction request
export const CreateTransactionRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().datetime(),
  category_id: z.string().uuid("Valid category is required"),
  account_id: z.string().uuid().optional(),
})

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>

// Update transaction request
export const UpdateTransactionRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  description: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  category_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
})

export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionRequestSchema>

// Transaction filters
export const TransactionFiltersSchema = z.object({
  category_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>

// Transaction analytics
export const TransactionAnalyticsSchema = z.object({
  total_income: z.number(),
  total_expenses: z.number(),
  net_amount: z.number(),
  transaction_count: z.number().int(),
  categories: z.array(
    z.object({
      category_id: z.string().uuid(),
      category_name: z.string(),
      category_type: z.enum(["expense", "income"]),
      amount: z.number(),
      count: z.number().int(),
    })
  ),
})

export type TransactionAnalytics = z.infer<typeof TransactionAnalyticsSchema>