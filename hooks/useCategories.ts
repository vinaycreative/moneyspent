import { useMemo } from "react"
import { 
  useFetchCategories, 
  useFetchCategoryById, 
  useFetchCategoriesWithStats,
  useFetchCategoryTransactions,
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/queries/categoryQueries"
import type { 
  Category, 
  CategoryWithStats, 
  CategoryType, 
  GetCategoriesQuery,
  GetCategoryTransactionsQuery,
  CategoryTransaction
} from "@/types"

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
export const useCategories = (userId: string, query?: GetCategoriesQuery, enabled = true): UseCategoriesReturn => {
  const queryResult = useFetchCategories(userId, query, enabled)
  
  const derivedValues = useMemo(() => {
    const categories = queryResult.data || []
    const expenseCategories = categories.filter(cat => cat.type === "expense")
    const incomeCategories = categories.filter(cat => cat.type === "income")
    
    return {
      categories,
      hasCategories: categories.length > 0,
      expenseCategories,
      incomeCategories,
      categoryCount: categories.length,
    }
  }, [queryResult.data])
  
  return {
    ...queryResult,
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

// Category transactions hook (for fetching transactions of a specific category by ID)
export const useFetchTransactionsForCategory = (
  categoryId: string,
  query?: GetCategoryTransactionsQuery,
  enabled = true
) => {
  const queryResult = useFetchCategoryTransactions(categoryId, query, enabled)
  
  const derivedValues = useMemo(() => {
    const transactions = queryResult.data || []
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const transactionCount = transactions.length
    
    // Group by date for better organization
    const transactionsByDate = transactions.reduce((acc, tx) => {
      const date = tx.occurred_at.split('T')[0] // Get date part
      if (!acc[date]) acc[date] = []
      acc[date].push(tx)
      return acc
    }, {} as Record<string, CategoryTransaction[]>)
    
    return {
      transactions,
      totalAmount,
      transactionCount,
      transactionsByDate,
    }
  }, [queryResult.data])
  
  return {
    ...queryResult,
    ...derivedValues,
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