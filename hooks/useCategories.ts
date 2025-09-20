import { useMemo } from "react"
import { 
  useFetchCategories, 
  useFetchCategoryById, 
  useFetchCategoriesWithStats,
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/queries/categoryQueries"
import type { Category, CategoryWithStats, CategoryType } from "@/types"

interface UseCategoriesReturn {
  data: Category[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  // Derived values
  categories: Category[]
  hasCategories: boolean
  expenseCategories: Category[]
  incomeCategories: Category[]
  categoryCount: number
}

// UI-ready categories hook with derived values
export const useCategories = (userId: string, enabled = true): UseCategoriesReturn => {
  const query = useFetchCategories(userId, enabled)
  
  const derivedValues = useMemo(() => {
    const categories = query.data || []
    const expenseCategories = categories.filter(cat => cat.type === "expense")
    const incomeCategories = categories.filter(cat => cat.type === "income")
    
    return {
      categories,
      hasCategories: categories.length > 0,
      expenseCategories,
      incomeCategories,
      categoryCount: categories.length,
    }
  }, [query.data])
  
  return {
    ...query,
    ...derivedValues,
  }
}

// Single category hook
export const useCategory = (id: string, enabled = true) => {
  const query = useFetchCategoryById(id, enabled)
  
  return {
    ...query,
    category: query.data,
  }
}

// Categories with stats hook
export const useCategoriesWithStats = (
  userId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  const query = useFetchCategoriesWithStats(userId, startDate, endDate, enabled)
  
  const derivedValues = useMemo(() => {
    const categoriesWithStats = query.data || []
    const topExpenseCategories = categoriesWithStats
      .filter(cat => cat.type === "expense")
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)
    
    const topIncomeCategories = categoriesWithStats
      .filter(cat => cat.type === "income")  
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)
    
    const totalExpenses = categoriesWithStats
      .filter(cat => cat.type === "expense")
      .reduce((sum, cat) => sum + cat.total_amount, 0)
      
    const totalIncome = categoriesWithStats
      .filter(cat => cat.type === "income")
      .reduce((sum, cat) => sum + cat.total_amount, 0)
    
    return {
      categoriesWithStats,
      topExpenseCategories,
      topIncomeCategories,
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
    }
  }, [query.data])
  
  return {
    ...query,
    ...derivedValues,
  }
}

// Category form helper hook
export const useCategoryForm = () => {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  
  return {
    create: createMutation.mutate,
    update: (id: string, data: any) => updateMutation.mutate({ id, data }),
    delete: deleteMutation.mutate,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    isError: createMutation.isError || updateMutation.isError || deleteMutation.isError,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  }
}

// Mutation hooks for direct use
export const useCreateCategoryMutation = () => useCreateCategory()
export const useUpdateCategoryMutation = () => useUpdateCategory()
export const useDeleteCategoryMutation = () => useDeleteCategory()