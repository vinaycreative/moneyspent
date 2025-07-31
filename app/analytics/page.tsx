"use client"

import { useState } from "react"
import { Filter, ChevronDown, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react"

interface Transaction {
  id: string
  title: string
  amount: number
  type: "expense" | "income"
  category: string
  date: string
  icon: string
  iconColor: string
}

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
  icon: string
}

export default function Analytics() {
  const [selectedDateRange, setSelectedDateRange] = useState("month")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const transactions: Transaction[] = [
    {
      id: "1",
      title: "Lunch",
      amount: 540,
      type: "expense",
      category: "Food",
      date: "2025-01-28",
      icon: "🍔",
      iconColor: "bg-yellow-400",
    },
    {
      id: "2",
      title: "Grocery",
      amount: 1200,
      type: "expense",
      category: "Shopping",
      date: "2025-01-27",
      icon: "🛒",
      iconColor: "bg-purple-400",
    },
    {
      id: "3",
      title: "Bike fuel",
      amount: 900,
      type: "expense",
      category: "Transport",
      date: "2025-01-26",
      icon: "⛽",
      iconColor: "bg-orange-400",
    },
    {
      id: "4",
      title: "Investment return",
      amount: 3400,
      type: "income",
      category: "Investment",
      date: "2025-01-25",
      icon: "₹",
      iconColor: "bg-green-400",
    },
    {
      id: "5",
      title: "Movie tickets",
      amount: 800,
      type: "expense",
      category: "Entertainment",
      date: "2025-01-24",
      icon: "🎬",
      iconColor: "bg-blue-400",
    },
    {
      id: "6",
      title: "Salary",
      amount: 50000,
      type: "income",
      category: "Salary",
      date: "2025-01-20",
      icon: "💰",
      iconColor: "bg-green-500",
    },
    {
      id: "7",
      title: "Dinner",
      amount: 750,
      type: "expense",
      category: "Food",
      date: "2025-01-23",
      icon: "🍽️",
      iconColor: "bg-yellow-400",
    },
    {
      id: "8",
      title: "Uber ride",
      amount: 300,
      type: "expense",
      category: "Transport",
      date: "2025-01-22",
      icon: "🚗",
      iconColor: "bg-orange-400",
    },
    {
      id: "9",
      title: "Netflix subscription",
      amount: 499,
      type: "expense",
      category: "Entertainment",
      date: "2025-01-21",
      icon: "📺",
      iconColor: "bg-blue-400",
    },
    {
      id: "10",
      title: "Shopping mall",
      amount: 2500,
      type: "expense",
      category: "Shopping",
      date: "2025-01-20",
      icon: "🛍️",
      iconColor: "bg-purple-400",
    },
  ]

  const getDateRangeLabel = () => {
    switch (selectedDateRange) {
      case "today":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "year":
        return "This Year"
      case "custom":
        return "Custom Range"
      default:
        return "This Month"
    }
  }

  const getFilteredTransactions = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      switch (selectedDateRange) {
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
          return transactionDate >= startOfMonth
      }
    })
  }

  const filteredTransactions = getFilteredTransactions()

  // Calculate analytics data
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses

  // Category breakdown for expenses
  const expenseCategories = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const existing = acc.find((item) => item.category === transaction.category)
      if (existing) {
        existing.amount += transaction.amount
      } else {
        acc.push({
          category: transaction.category,
          amount: transaction.amount,
          percentage: 0,
          color: transaction.iconColor,
          icon: transaction.icon,
        })
      }
      return acc
    }, [] as CategoryData[])

  // Calculate percentages
  expenseCategories.forEach((category) => {
    category.percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  })

  // Sort by amount descending
  expenseCategories.sort((a, b) => b.amount - a.amount)

  // Monthly spending trend (last 6 months)
  const getMonthlyTrend = () => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthExpenses = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date)
          return (
            t.type === "expense" && transactionDate >= monthStart && transactionDate <= monthEnd
          )
        })
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({ month: monthName, amount: monthExpenses })
    }
    return months
  }

  const monthlyTrend = getMonthlyTrend()

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Mobile container - max width for desktop */}
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Header Section */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-black">Analytics</h1>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{getDateRangeLabel()}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Date Filter Dropdown */}
              {showDateFilter && (
                <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedDateRange("today")
                        setShowDateFilter(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedDateRange === "today"
                          ? "bg-orange-100 text-orange-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDateRange("week")
                        setShowDateFilter(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedDateRange === "week"
                          ? "bg-orange-100 text-orange-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDateRange("month")
                        setShowDateFilter(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedDateRange === "month"
                          ? "bg-orange-100 text-orange-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDateRange("year")
                        setShowDateFilter(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedDateRange === "year"
                          ? "bg-orange-100 text-orange-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      This Year
                    </button>

                    {/* Custom Date Range */}
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Custom Range</div>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Start Date"
                        />
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="End Date"
                        />
                        <button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              setSelectedDateRange("custom")
                              setShowDateFilter(false)
                            }
                          }}
                          className="w-full px-3 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                        >
                          Apply Custom Range
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-red-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <div className="text-xs text-red-600">Expenses</div>
                </div>
                <div className="text-lg font-bold text-red-600">
                  ₹ {totalExpenses.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div className="text-xs text-green-600">Income</div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  ₹ {totalIncome.toLocaleString()}
                </div>
              </div>
              <div className={`rounded-xl p-3 ${netSavings >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`text-xs ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    Savings
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    netSavings >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹ {Math.abs(netSavings).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Content */}
          <div className="px-4 space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-800">Spending by Category</h2>
              </div>

              {expenseCategories.length > 0 ? (
                <div className="space-y-3">
                  {expenseCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{category.category}</span>
                          <span className="text-sm text-gray-600">
                            ₹ {category.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-sm">No expenses in this period</div>
                </div>
              )}
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-800">Monthly Spending Trend</h2>
              </div>

              <div className="space-y-3">
                {monthlyTrend.map((month, index) => {
                  const maxAmount = Math.max(...monthlyTrend.map((m) => m.amount))
                  const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0

                  return (
                    <div key={month.month} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-600 font-medium">{month.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            ₹ {month.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Insights</h2>

              <div className="space-y-3">
                {expenseCategories.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 text-sm">💰</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        Top Spending Category
                      </div>
                      <div className="text-xs text-gray-600">
                        {expenseCategories[0].category} - ₹{" "}
                        {expenseCategories[0].amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Average Daily Spending</div>
                    <div className="text-xs text-gray-600">
                      ₹ {Math.round(totalExpenses / 30).toLocaleString()} per day
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    netSavings >= 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      netSavings >= 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <span
                      className={`text-sm ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {netSavings >= 0 ? "✅" : "⚠️"}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {netSavings >= 0 ? "Positive Savings" : "Negative Savings"}
                    </div>
                    <div className="text-xs text-gray-600">
                      {netSavings >= 0
                        ? "Great job managing expenses!"
                        : "Consider reducing expenses"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
