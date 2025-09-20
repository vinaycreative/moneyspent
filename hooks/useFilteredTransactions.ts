import { useMemo } from "react"
import { useTransactions } from "./useTransactions"

interface UseFilteredTransactionsOptions {
  userId: string
  dateRange: "all" | "today" | "week" | "month" | "year" | "custom"
  customStartDate?: string
  customEndDate?: string
  accountId?: string
  transactionType?: "expense" | "income" | "all"
  enabled?: boolean
}

export function useFilteredTransactions({
  userId,
  dateRange,
  customStartDate,
  customEndDate,
  accountId,
  transactionType = "all",
  enabled = true,
}: UseFilteredTransactionsOptions) {
  const { transactions, isLoading, error } = useTransactions({}, enabled && !!userId)

  const filteredTransactions = useMemo(() => {
    if (!transactions) return []

    let filtered = transactions

    // Filter by account if specified and not "all"
    if (accountId && accountId !== "all") {
      filtered = filtered.filter((transaction: any) => transaction.account_id === accountId)
    }

    // Filter by transaction type if specified
    if (transactionType && transactionType !== "all") {
      filtered = filtered.filter((transaction: any) => transaction.type === transactionType)
    }

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    return filtered.filter((transaction: any) => {
      const transactionDate = new Date(transaction.occurred_at)

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
  }, [transactions, dateRange, customStartDate, customEndDate, accountId, transactionType])

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