import { useMemo } from "react"
import { useTransactions } from "./use-transactions"

interface UseFilteredTransactionsOptions {
  userId: string
  dateRange: "all" | "today" | "week" | "month" | "year" | "custom"
  customStartDate?: string
  customEndDate?: string
  enabled?: boolean
}

export function useFilteredTransactions({
  userId,
  dateRange,
  customStartDate,
  customEndDate,
  enabled = true,
}: UseFilteredTransactionsOptions) {
  const { data: transactions, isLoading, error } = useTransactions(userId, { enabled })

  const filteredTransactions = useMemo(() => {
    if (!transactions) return []

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    return transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.transaction_date)

      switch (dateRange) {
        case "today":
          return transactionDate >= startOfDay
        case "week":
          return transactionDate >= startOfWeek
        case "month":
          return transactionDate >= startOfMonth
        case "year":
          return transactionDate >= startOfYear
        case "custom":
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate)
            const endDate = new Date(customEndDate)
            endDate.setHours(23, 59, 59)
            return transactionDate >= startDate && transactionDate <= endDate
          }
          return true
        default:
          return true
      }
    })
  }, [transactions, dateRange, customStartDate, customEndDate])

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0)
  }, [filteredTransactions])

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0)
  }, [filteredTransactions])

  const netSavings = useMemo(() => {
    return totalIncome - totalExpenses
  }, [totalIncome, totalExpenses])

  return {
    transactions: filteredTransactions,
    totalExpenses,
    totalIncome,
    netSavings,
    isLoading,
    error,
  }
} 