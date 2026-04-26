"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
} from "lucide-react"
import { useAuth, useAnalytics } from "@/hooks"

export default function Analytics() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState("month")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

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
    dateRange: selectedDateRange as 'today' | 'week' | 'month' | 'year' | 'custom',
    customStartDate: customStartDate || undefined,
    customEndDate: customEndDate || undefined,
    enabled: !!user?.id,
  })

  const summaryLoading = analyticsLoading

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" className="h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto border-ms-accent"></div>
          <p className="mt-2 text-sm" className="text-ms-muted">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center" className="h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="text-sm" className="text-ms-muted">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  const getDateRangeLabel = () => {
    switch (selectedDateRange) {
      case "today": return "Today"
      case "week": return "This Week"
      case "month": return "This Month"
      case "year": return "This Year"
      case "custom": return "Custom Range"
      default: return "This Month"
    }
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Header + Date Filter Toggle */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-ink">Analytics</h1>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors bg-surface-alt border border-line text-ink"
          >
            <Filter className="w-4 h-4" className="text-ms-muted" />
            <span>{getDateRangeLabel()}</span>
            <ChevronDown className="w-4 h-4" className="text-ms-muted" />
          </button>
        </div>

        {showDateFilter && (
          <div
            className="mt-3 p-4 rounded-xl shadow-lg bg-surface border border-line"
          >
            <div className="space-y-1">
              {["today", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => { setSelectedDateRange(range); setShowDateFilter(false) }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: selectedDateRange === range ? "color-mix(in oklab, var(--ms-accent) 15%, var(--surface))" : "transparent",
                    color: selectedDateRange === range ? "var(--ms-accent)" : "var(--ink)",
                  }}
                >
                  {range === "today" ? "Today" : range === "week" ? "This Week" : range === "month" ? "This Month" : "This Year"}
                </button>
              ))}
              <div className="border-t border-line pt-3 mt-1">
                <div className="text-sm font-medium mb-2" className="text-ms-muted">Custom Range</div>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-line bg-surface-alt text-ink"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-line bg-surface-alt text-ink"
                  />
                  <button
                    onClick={() => { if (customStartDate && customEndDate) { setSelectedDateRange("custom"); setShowDateFilter(false) } }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-ms-accent text-white"
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
        <div
          className="rounded-xl p-4 bg-neg/10 border border-neg/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-neg" />
            <div className="text-xs font-medium text-neg">Expenses</div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse h-6 w-16 rounded bg-neg/20"></div>
          ) : (
            <div className="text-lg font-bold text-neg">
              ₹ {totalExpenses.toLocaleString()}
            </div>
          )}
        </div>
        <div
          className="rounded-xl p-4 bg-pos/10 border border-pos/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-pos" />
            <div className="text-xs font-medium text-pos">Income</div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse h-6 w-16 rounded bg-pos/20"></div>
          ) : (
            <div className="text-lg font-bold text-pos">
              ₹ {totalIncome.toLocaleString()}
            </div>
          )}
        </div>
        <div
          className="rounded-xl col-span-2 p-4"
          style={{
            background: netSavings >= 0
              ? "color-mix(in oklab, var(--ms-accent) 10%, var(--surface))"
              : "color-mix(in oklab, var(--neg) 10%, var(--surface))",
            border: `1px solid ${netSavings >= 0
              ? "color-mix(in oklab, var(--ms-accent) 25%, var(--line))"
              : "color-mix(in oklab, var(--neg) 25%, var(--line))"}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4" className={netSavings >= 0 ? "text-ms-accent" : "text-neg"} />
            <div className="text-xs font-medium" className={netSavings >= 0 ? "text-ms-accent" : "text-neg"}>
              Savings
            </div>
          </div>
          {summaryLoading ? (
            <div className="animate-pulse h-6 w-16 rounded bg-surface-alt"></div>
          ) : (
            <div className="text-lg font-bold" className={netSavings >= 0 ? "text-ms-accent" : "text-neg"}>
              ₹ {Math.abs(netSavings).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Content */}
      <div className="px-4 space-y-4 pb-6">
        {/* Category Breakdown */}
        <div
          className="rounded-xl p-5 bg-surface border border-line"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-ms-accent/15"
            >
              <PieChart className="w-5 h-5 text-ms-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Spending by Category</h2>
              <p className="text-sm" className="text-ms-muted">Breakdown of your expenses</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-surface-alt"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-1/3 bg-surface-alt"></div>
                    <div className="h-2 rounded w-full bg-surface-alt"></div>
                  </div>
                  <div className="h-4 rounded w-16 bg-surface-alt"></div>
                </div>
              ))}
            </div>
          ) : expenseCategories.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {expenseCategories.map((category: { category: string; amount: number; percentage: number; count: number; color: string; icon: string }) => (
                <div
                  key={category.category}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-line"
                  onClick={() => router.push(`/analytics/${encodeURIComponent(category.category.toLowerCase())}`)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-ink">{category.category}</span>
                      <span className="text-sm font-medium text-ink">
                        ₹ {category.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-surface-alt">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          className="bg-ms-accent" style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs min-w-[40px]" className="text-ms-muted">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" className="text-ms-muted">
                      {category.count} transaction{category.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" className="text-ms-muted">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-surface-alt"
              >
                <PieChart className="w-8 h-8" className="text-ms-muted" />
              </div>
              <div className="text-sm font-medium mb-1">No expenses in this period</div>
              <div className="text-xs">Add some transactions to see your spending breakdown</div>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div
          className="rounded-xl p-5 bg-surface border border-line"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-ms-accent/15"
            >
              <BarChart3 className="w-5 h-5 text-ms-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Monthly Spending Trend</h2>
              <p className="text-sm" className="text-ms-muted">Last 6 months overview</p>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyTrend && monthlyTrend.map((month, index) => {
              const maxAmount = Math.max(...monthlyTrend.map((m) => m.amount))
              const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0
              const isCurrentMonth = index === monthlyTrend.length - 1
              return (
                <div key={`${month.month}-${index}`} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium" className="text-ms-muted">
                    {month.month}
                    {isCurrentMonth && <span className="text-ms-accent">*</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full bg-surface-alt">
                        <div
                          className="h-3 rounded-full transition-all duration-300"
                          className="bg-ms-accent" style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20 text-right text-ink">
                        ₹ {month.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="text-xs" className="text-ms-muted">* Current month</div>
          </div>
        </div>

        {/* Insights */}
        <div
          className="rounded-xl p-5 bg-surface border border-line"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-ms-accent/15"
            >
              <Target className="w-5 h-5 text-ms-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Smart Insights</h2>
              <p className="text-sm" className="text-ms-muted">Key financial insights</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.topCategory && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                className="bg-ms-accent/10 border border-ms-accent/20"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" className="bg-ms-accent/15">
                  <span className="text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">Top Spending Category</div>
                  <div className="text-xs" className="text-ms-muted">
                    {insights.topCategory.category} - ₹ {insights.topCategory.amount.toLocaleString()}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4" className="text-ms-accent" />
              </div>
            )}

            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-ms-accent/10 border border-ms-accent/20"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" className="bg-ms-accent/15">
                <span className="text-lg">📊</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">Average Daily Spending</div>
                <div className="text-xs" className="text-ms-muted">
                  ₹ {Math.round(insights.avgDailySpending).toLocaleString()} per day
                </div>
              </div>
              <ArrowDownRight className="w-4 h-4" className="text-ms-muted" />
            </div>

            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-pos/10 border border-pos/20"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pos/15">
                <span className="text-lg">📈</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">Transaction Activity</div>
                <div className="text-xs" className="text-ms-muted">
                  {insights.transactionCount} transaction{insights.transactionCount !== 1 ? "s" : ""} this period
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-pos" />
            </div>

            {insights.mostActiveDay && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-alt border border-line"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface">
                  <span className="text-lg">📅</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">Most Active Day</div>
                  <div className="text-xs" className="text-ms-muted">
                    {insights.mostActiveDay} - Most transactions on this day
                  </div>
                </div>
                <CheckCircle className="w-4 h-4" className="text-ms-muted" />
              </div>
            )}

            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${netSavings >= 0 ? "bg-pos/10 border border-pos/20" : "bg-neg/10 border border-neg/20"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netSavings >= 0 ? "bg-pos/15" : "bg-neg/15"}`}>
                <span className="text-lg">{netSavings >= 0 ? "✅" : "⚠️"}</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">
                  {netSavings >= 0 ? "Positive Savings" : "Negative Savings"}
                </div>
                <div className="text-xs" className="text-ms-muted">
                  {netSavings >= 0
                    ? `You're saving ${insights.savingsRate.toFixed(1)}% of your income`
                    : "Consider reducing expenses to improve savings"}
                </div>
              </div>
              {netSavings >= 0 ? (
                <CheckCircle className="w-4 h-4 text-pos" />
              ) : (
                <AlertCircle className="w-4 h-4 text-neg" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
