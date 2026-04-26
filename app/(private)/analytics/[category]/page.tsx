"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Filter, ChevronDown, Calendar, IndianRupee } from "lucide-react"
import { useAuth, useCategoryTransactions } from "@/hooks"
import moment from "moment"

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState("month")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const category = params.category as string
  const decodedCategory = decodeURIComponent(category)

  const { data: transactions, isLoading: transactionsLoading } = useCategoryTransactions({
    userId: user?.id || "",
    category: decodedCategory,
    dateRange: selectedDateRange as 'today' | 'week' | 'month' | 'year' | 'custom' | 'all',
    customStartDate: customStartDate || undefined,
    customEndDate: customEndDate || undefined,
    enabled: !!user?.id,
  })

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto border-ms-accent"></div>
          <p className="mt-2 text-sm text-ms-muted">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="text-sm text-ms-muted">Please sign in to continue</p>
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
      case "all": return "All Time"
      default: return "This Month"
    }
  }

  const totalAmount = (transactions || []).reduce(
    (sum: number, transaction: { amount: number }) => sum + transaction.amount,
    0
  )

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Header */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl cursor-pointer transition-colors bg-surface-alt border border-line"
          >
            <ArrowLeft className="w-5 h-5 text-ms-muted" />
          </button>
          <div>
            <h1 className="text-lg font-bold capitalize text-ink">
              {decodedCategory.replace(/_/g, " ")}
            </h1>
            <p className="text-sm text-ms-muted">Category Transactions</p>
          </div>
        </div>

        {/* Totals + Filter */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-ms-muted">
            Total:{" "}
            <span className="font-bold text-base text-ink">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors bg-surface-alt border border-line text-ink"
          >
            <Filter className="w-4 h-4 text-ms-muted" />
            <span>{getDateRangeLabel()}</span>
            <ChevronDown className="w-4 h-4 text-ms-muted" />
          </button>
        </div>

        {showDateFilter && (
          <div
            className="mt-3 p-4 rounded-xl shadow-lg bg-surface border border-line"
          >
            <div className="space-y-1">
              {["today", "week", "month", "year", "all"].map((range) => (
                <button
                  key={range}
                  onClick={() => { setSelectedDateRange(range); setShowDateFilter(false) }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: selectedDateRange === range ? "color-mix(in oklab, var(--ms-accent) 15%, var(--surface))" : "transparent",
                    color: selectedDateRange === range ? "var(--ms-accent)" : "var(--ink)",
                  }}
                >
                  {range === "today" ? "Today" : range === "week" ? "This Week" : range === "month" ? "This Month" : range === "year" ? "This Year" : "All Time"}
                </button>
              ))}
              <div className="border-t border-line pt-3 mt-1">
                <div className="text-sm font-medium mb-2 text-ms-muted">Custom Range</div>
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

      {/* Transactions List */}
      <div className="px-4 space-y-3 pb-6">
        {transactionsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 animate-pulse bg-surface border border-line"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 rounded w-1/3 bg-surface-alt"></div>
                  <div className="h-4 rounded w-20 bg-surface-alt"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 rounded w-1/4 bg-surface-alt"></div>
                  <div className="h-3 rounded w-16 bg-surface-alt"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (transactions || []).length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction: { id: string; title?: string; description: string | null; amount: number; occurred_at: string; accounts?: { name: string; type: string } }) => (
              <div
                key={transaction.id}
                className="rounded-xl p-4 flex items-center justify-between transition-colors bg-surface border border-line"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-ink">
                    {transaction.title || transaction.description}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-ms-muted">
                    <Calendar className="w-4 h-4" />
                    <span>{moment(transaction.occurred_at).format("lll")}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-neg">
                    -₹ {transaction.amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-ms-muted">
                    {transaction.accounts?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-ms-muted">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-surface-alt"
            >
              <IndianRupee className="w-8 h-8 text-ms-muted" />
            </div>
            <div className="text-sm font-medium mb-1">No transactions found</div>
            <div className="text-xs">
              No transactions found for {decodedCategory} in this period
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
