// Re-export categories functionality from the main hooks directory
// This maintains compatibility with existing imports while keeping the hooks logic centralized
export { 
  useCategories, 
  useCategory, 
  useCategoriesWithStats,
  useCategoryForm,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from "@/hooks/useCategories"