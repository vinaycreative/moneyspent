import { z } from "zod"

// Category kind enum (API uses 'kind', frontend uses 'type')
export const CategoryKindSchema = z.enum(["expense", "income", "transfer"])
export type CategoryKind = z.infer<typeof CategoryKindSchema>

// For backward compatibility, keep the type enum
export const CategoryTypeSchema = z.enum(["expense", "income"])
export type CategoryType = z.infer<typeof CategoryTypeSchema>

// API Category schema (what we receive from backend)
export const ApiCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  kind: CategoryKindSchema,
  icon: z.string().min(1).max(50),
  color: z.string().min(1), // Accept any color format (hex, tailwind class, etc)
  is_default: z.boolean(),
  user_id: z.string().uuid().nullable(), // Allow null user_id for default categories
  created_at: z.string(), // Accept any datetime string format
  updated_at: z.string(), // Accept any datetime string format
})

export type ApiCategory = z.infer<typeof ApiCategorySchema>

// Frontend Category schema (transformed for UI)
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: CategoryTypeSchema, // Maps from API 'kind' field
  icon: z.string().min(1),
  color: z.string().min(1),
  is_default: z.boolean().optional(),
  user_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Category = z.infer<typeof CategorySchema>

// Create category request (API format)
export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  kind: CategoryKindSchema,
  icon: z.string().min(1, "Icon is required").max(50),
  color: z.string().min(1, "Color is required").optional().default("#6366f1"),
  is_default: z.boolean().optional().default(false),
})

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>

// Update category request (API format)
export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  kind: CategoryKindSchema.optional(),
  icon: z.string().min(1).max(50).optional(),
  color: z.string().min(1).optional(),
  is_default: z.boolean().optional(),
})

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>

// Query parameters for categories
export const GetCategoriesQuerySchema = z.object({
  kind: CategoryKindSchema.optional(),
})

export type GetCategoriesQuery = z.infer<typeof GetCategoriesQuerySchema>

// Query parameters for category transactions
export const GetCategoryTransactionsQuerySchema = z.object({
  dateRange: z.enum(["today", "week", "month", "year", "all", "custom"]).optional(),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
})

export type GetCategoryTransactionsQuery = z.infer<typeof GetCategoryTransactionsQuerySchema>

// Category transaction schema (from API)
export const CategoryTransactionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  amount: z.number(),
  type: z.enum(["expense", "income", "transfer"]),
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  occurred_at: z.string().datetime(),
  currency: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Relations
  categories: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      icon: z.string(),
      color: z.string(),
      kind: CategoryKindSchema,
    })
    .nullable(),
  accounts: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.string(),
    })
    .nullable(),
})

export type CategoryTransaction = z.infer<typeof CategoryTransactionSchema>

// Category with transaction count (for analytics)
export const CategoryWithStatsSchema = CategorySchema.extend({
  transaction_count: z.number().int().min(0),
  total_amount: z.number(),
})

export type CategoryWithStats = z.infer<typeof CategoryWithStatsSchema>

// Transformation functions
export const transformApiCategory = (apiCategory: ApiCategory): Category => {
  const { kind, ...rest } = apiCategory
  return {
    ...rest,
    type: kind === "transfer" ? "expense" : (kind as "expense" | "income"), // Map transfer to expense for UI, keep expense/income as is
  }
}

export const transformCategoryForApi = (
  category: Partial<Category> & { type?: CategoryType }
): Partial<ApiCategory> => {
  const { type, ...rest } = category
  return {
    ...rest,
    kind: type || "expense", // Default to expense if not specified
  }
}
