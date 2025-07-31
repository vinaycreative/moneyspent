"use client"

import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from "lucide-react"

interface DashboardStatsProps {
  totalExpenses: number
  totalIncome: number
  netSavings: number
  transactionCount: number
  isLoading: boolean
}

export function DashboardStats({
  totalExpenses,
  totalIncome,
  netSavings,
  transactionCount,
  isLoading,
}: DashboardStatsProps) {
  const getSavingsPercentage = () => {
    if (totalIncome === 0) return 0
    return Math.round((netSavings / totalIncome) * 100)
  }

  const getSpendingTrend = () => {
    if (totalExpenses === 0) return "neutral"
    if (netSavings >= 0) return "positive"
    return "negative"
  }

  const savingsPercentage = getSavingsPercentage()
  const spendingTrend = getSpendingTrend()

  return (
    <div className="space-y-3">
      {/* Total Spent Card */}
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <div className="text-sm text-red-600 font-medium">Total Spent</div>
          </div>
          {isLoading && <div className="animate-pulse bg-red-200 h-4 w-16 rounded"></div>}
        </div>
        <div className="text-2xl font-bold text-red-600">₹ {totalExpenses.toLocaleString()}</div>
        <div className="text-xs text-red-500 mt-1">
          {transactionCount > 0
            ? `${transactionCount} transaction${transactionCount !== 1 ? "s" : ""}`
            : "No transactions yet"}
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div className="text-sm text-green-600 font-medium">Total Income</div>
          </div>
          {isLoading && <div className="animate-pulse bg-green-200 h-4 w-16 rounded"></div>}
        </div>
        <div className="text-2xl font-bold text-green-600">₹ {totalIncome.toLocaleString()}</div>
        <div className="text-xs text-green-500 mt-1">
          {totalIncome > 0 ? "Income received" : "No income yet"}
        </div>
      </div>

      {/* Net Savings Card */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <div className="text-sm text-blue-600 font-medium">Net Savings</div>
          </div>
          {isLoading && <div className="animate-pulse bg-blue-200 h-4 w-16 rounded"></div>}
        </div>
        <div
          className={`text-2xl font-bold ${netSavings >= 0 ? "text-blue-600" : "text-red-600"}`}
        >
          ₹ {netSavings.toLocaleString()}
        </div>
        <div className="text-xs text-blue-500 mt-1">
          {netSavings >= 0
            ? `Saving ${savingsPercentage}% of income`
            : "Spending more than earning"}
        </div>
      </div>

      {/* Quick Insights */}
      {transactionCount > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-gray-600" />
            <div className="text-sm font-medium text-gray-700">Quick Insights</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Savings Rate:</span>
              <span
                className={`font-medium ${
                  savingsPercentage >= 20
                    ? "text-green-600"
                    : savingsPercentage >= 10
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {savingsPercentage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spending Trend:</span>
              <span
                className={`font-medium ${
                  spendingTrend === "positive"
                    ? "text-green-600"
                    : spendingTrend === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {spendingTrend === "positive"
                  ? "Good"
                  : spendingTrend === "negative"
                  ? "High"
                  : "Neutral"}
              </span>
            </div>
            {totalIncome > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Daily Spending:</span>
                <span className="font-medium text-gray-700">
                  ₹ {Math.round(totalExpenses / 30).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
