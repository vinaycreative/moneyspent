import { useMemo } from "react"
import { useFilteredTransactions } from "./use-filtered-transactions"

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
  icon: string
  count: number
}

interface MonthlyTrend {
  month: string
  amount: number
}

interface AnalyticsInsights {
  avgDailySpending: number
  savingsRate: number
  topCategory: CategoryData | null
  transactionCount: number
  avgTransactionAmount: number
  expenseToIncomeRatio: number
  mostActiveDay: string | null
  spendingTrend: "increasing" | "decreasing" | "stable"
}

interface UseAnalyticsOptions {
  userId: string
  dateRange: "all" | "today" | "week" | "month" | "year" | "custom"
  customStartDate?: string
  customEndDate?: string
  enabled?: boolean
}

export function useAnalytics({
  userId,
  dateRange,
  customStartDate,
  customEndDate,
  enabled = true,
}: UseAnalyticsOptions) {
  const {
    transactions: filteredTransactions,
    totalExpenses,
    totalIncome,
    netSavings,
    isLoading,
    error,
  } = useFilteredTransactions({
    userId,
    dateRange,
    customStartDate,
    customEndDate,
    enabled,
  })

  // Category breakdown for expenses
  const expenseCategories = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter((t: any) => t.type === "expense")

    const categoryMap = new Map<string, CategoryData>()

    expenseTransactions.forEach((transaction: any) => {
      const categoryName = transaction.categories?.name || "Other"
      const existing = categoryMap.get(categoryName)

      if (existing) {
        existing.amount += transaction.amount
        existing.count += 1
      } else {
        categoryMap.set(categoryName, {
          category: categoryName,
          amount: transaction.amount,
          percentage: 0,
          color: transaction.categories?.color || "bg-gray-400",
          icon: transaction.categories?.icon || "💰",
          count: 1,
        })
      }
    })

    const categories = Array.from(categoryMap.values())

    // Calculate percentages
    categories.forEach((category) => {
      category.percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
    })

    // Sort by amount descending
    return categories.sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions, totalExpenses])

  // Monthly spending trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: MonthlyTrend[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthExpenses = filteredTransactions
        .filter((t: any) => {
          const transactionDate = new Date(t.transaction_date)
          return (
            t.type === "expense" && transactionDate >= monthStart && transactionDate <= monthEnd
          )
        })
        .reduce((sum: number, t: any) => sum + t.amount, 0)

      months.push({ month: monthName, amount: monthExpenses })
    }
    return months
  }, [filteredTransactions])

  // Calculate comprehensive insights
  const insights = useMemo((): AnalyticsInsights => {
    const avgDailySpending = totalExpenses / 30
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
    const topCategory = expenseCategories[0] || null
    const transactionCount = filteredTransactions.length
    const avgTransactionAmount = transactionCount > 0 ? totalExpenses / transactionCount : 0
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

    // Find most active day
    const dayCounts = new Map<string, number>()
    filteredTransactions.forEach((transaction: any) => {
      const day = new Date(transaction.transaction_date).toLocaleDateString("en-US", {
        weekday: "long",
      })
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
    })
    const mostActiveDay =
      dayCounts.size > 0 ? Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0][0] : null

    // Determine spending trend
    let spendingTrend: "increasing" | "decreasing" | "stable" = "stable"
    if (monthlyTrend.length >= 2) {
      const recent = monthlyTrend.slice(-2)
      if (recent[1].amount > recent[0].amount * 1.1) {
        spendingTrend = "increasing"
      } else if (recent[1].amount < recent[0].amount * 0.9) {
        spendingTrend = "decreasing"
      }
    }

    return {
      avgDailySpending,
      savingsRate,
      topCategory,
      transactionCount,
      avgTransactionAmount,
      expenseToIncomeRatio,
      mostActiveDay,
      spendingTrend,
    }
  }, [
    totalExpenses,
    totalIncome,
    netSavings,
    expenseCategories,
    filteredTransactions,
    monthlyTrend,
  ])

  return {
    // Data
    transactions: filteredTransactions,
    expenseCategories,
    monthlyTrend,
    insights,

    // Summary
    totalExpenses,
    totalIncome,
    netSavings,

    // State
    isLoading,
    error,
  }
}
