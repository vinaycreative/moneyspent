"use client"

import { useState } from "react"
import {
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAnalytics, useTransactionSummary } from "@/lib/hooks"

export default function Analytics() {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState("month")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  // Get analytics data with the new hook
  const {
    expenseCategories,
    monthlyTrend,
    insights,
    totalExpenses,
    totalIncome,
    netSavings,
    isLoading: analyticsLoading,
  } = useAnalytics({
    userId: user?.id || "",
    dateRange: selectedDateRange as any,
    customStartDate: customStartDate || undefined,
    customEndDate: customEndDate || undefined,
    enabled: !!user?.id,
  })

  // Get transaction summary for the filtered date range
  const { data: summary, isLoading: summaryLoading } = useTransactionSummary(user?.id || "", {
    enabled: !!user?.id,
  })

  if (authLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Date Range Filter */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>{getDateRangeLabel()}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
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
      <div className="grid grid-cols-2 gap-3 px-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-md p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <div className="text-xs font-medium text-red-600">Expenses</div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse bg-red-200 h-6 w-16 rounded"></div>
          ) : (
            <div className="text-lg font-bold text-red-600">
              ₹ {totalExpenses.toLocaleString()}
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-md p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div className="text-xs font-medium text-green-600">Income</div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse bg-green-200 h-6 w-16 rounded"></div>
          ) : (
            <div className="text-lg font-bold text-green-600">
              ₹ {totalIncome.toLocaleString()}
            </div>
          )}
        </div>
        <div
          className={`rounded-md col-span-2 p-4 border ${
            netSavings >= 0
              ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
              : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee
              className={`w-4 h-4 ${netSavings >= 0 ? "text-blue-600" : "text-orange-600"}`}
            />
            <div
              className={`text-xs font-medium ${
                netSavings >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            >
              Savings
            </div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
          ) : (
            <div
              className={`text-lg font-bold ${
                netSavings >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            >
              ₹ {Math.abs(netSavings).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Content */}
      <div className="px-4 space-y-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Spending by Category</h2>
              <p className="text-sm text-gray-500">Breakdown of your expenses</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : expenseCategories.length > 0 ? (
            <div className="space-y-4">
              {expenseCategories.slice(0, 5).map((category, index) => (
                <div key={category.category} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm font-medium text-gray-700">
                        ₹ {category.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 min-w-[40px]">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {category.count} transaction{category.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-sm font-medium mb-1">No expenses in this period</div>
              <div className="text-xs">Add some transactions to see your spending breakdown</div>
            </div>
          )}
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Monthly Spending Trend</h2>
              <p className="text-sm text-gray-500">Last 6 months overview</p>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyTrend.map((month, index) => {
              const maxAmount = Math.max(...monthlyTrend.map((m) => m.amount))
              const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0
              const isCurrentMonth = index === monthlyTrend.length - 1

              return (
                <div key={`${month.month}-${index}`} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {month.month}
                    {isCurrentMonth && <span className="text-blue-600">*</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-20 text-right">
                        ₹ {month.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="text-xs text-gray-500 mt-2">* Current month</div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Smart Insights</h2>
              <p className="text-sm text-gray-500">Key financial insights</p>
            </div>
          </div>

          <div className="space-y-4">
            {insights.topCategory && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Top Spending Category</div>
                  <div className="text-xs text-gray-600">
                    {insights.topCategory.category} - ₹{" "}
                    {insights.topCategory.amount.toLocaleString()}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-orange-500" />
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Average Daily Spending</div>
                <div className="text-xs text-gray-600">
                  ₹ {Math.round(insights.avgDailySpending).toLocaleString()} per day
                </div>
              </div>
              <ArrowDownRight className="w-4 h-4 text-blue-500" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">📈</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Transaction Activity</div>
                <div className="text-xs text-gray-600">
                  {insights.transactionCount} transaction
                  {insights.transactionCount !== 1 ? "s" : ""} this period
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            {insights.mostActiveDay && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">📅</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Most Active Day</div>
                  <div className="text-xs text-gray-600">
                    {insights.mostActiveDay} - Most transactions on this day
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-indigo-500" />
              </div>
            )}

            <div
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                netSavings >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  netSavings >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span className={`text-lg ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {netSavings >= 0 ? "✅" : "⚠️"}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {netSavings >= 0 ? "Positive Savings" : "Negative Savings"}
                </div>
                <div className="text-xs text-gray-600">
                  {netSavings >= 0
                    ? `You're saving ${insights.savingsRate.toFixed(1)}% of your income`
                    : "Consider reducing expenses to improve savings"}
                </div>
              </div>
              {netSavings >= 0 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
