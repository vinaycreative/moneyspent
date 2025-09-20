import { z } from "zod"

// Category type enum
export const CategoryTypeSchema = z.enum(["expense", "income"])
export type CategoryType = z.infer<typeof CategoryTypeSchema>

// Category schema
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: CategoryTypeSchema,
  icon: z.string().min(1),
  color: z.string().min(1),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Category = z.infer<typeof CategorySchema>

// Create category request
export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: CategoryTypeSchema,
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
})

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>

// Update category request
export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1).optional(),
  type: CategoryTypeSchema.optional(),
  icon: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
})

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>

// Category with transaction count (for analytics)
export const CategoryWithStatsSchema = CategorySchema.extend({
  transaction_count: z.number().int().min(0),
  total_amount: z.number(),
})

export type CategoryWithStats = z.infer<typeof CategoryWithStatsSchema>