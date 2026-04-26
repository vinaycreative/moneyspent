"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

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
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Spent */}
      <div className="bg-neg/10 border border-neg/20 rounded-xl px-3 py-3.5">
        <div className="flex items-center gap-2 mb-2 text-neg">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs font-medium">
            Total Spent
          </span>
        </div>
        <div
          className="text-2xl font-bold flex items-center gap-1 text-neg"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          ₹{" "}
          {isLoading ? (
            <div
              className="animate-pulse h-6 w-16 rounded bg-neg/20"
            />
          ) : (
            totalExpenses.toLocaleString()
          )}
        </div>
        <div className="text-xs mt-1 text-ms-muted">
          {transactionCount > 0
            ? `${transactionCount} transaction${transactionCount !== 1 ? "s" : ""}`
            : "No transactions yet"}
        </div>
      </div>

      {/* Total Income */}
      <div className="bg-pos/10 border border-pos/20 rounded-xl px-3 py-3.5">
        <div className="flex items-center gap-2 mb-2 text-pos">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">
            Total Income
          </span>
        </div>
        <div
          className="text-2xl font-bold flex items-center gap-1 text-pos"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          ₹{" "}
          {isLoading ? (
            <div
              className="animate-pulse h-6 w-16 rounded bg-pos/20"
            />
          ) : (
            totalIncome.toLocaleString()
          )}
        </div>
        <div className="text-xs mt-1 text-ms-muted">
          {totalIncome > 0 ? "Income received" : "No income yet"}
        </div>
      </div>
    </div>
  )
}
