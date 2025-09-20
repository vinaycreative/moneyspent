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

  // Get transactions for this category
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
      case "all":
        return "All Time"
      default:
        return "This Month"
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
            className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 capitalize">
              {decodedCategory.replace(/_/g, " ")}
            </h1>
            <p className="text-sm text-gray-500">Category Transactions</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total:{" "}
            <span className="font-bold text-base text-gray-900">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
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

              <button
                onClick={() => {
                  setSelectedDateRange("all")
                  setShowDateFilter(false)
                }}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedDateRange === "all"
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-gray-50"
                }`}
              >
                All Time
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

      {/* Transactions List */}
      <div className="px-4 space-y-4 pb-6">
        {transactionsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (transactions || []).length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction: { id: string; title?: string; description: string | null; amount: number; occurred_at: string; accounts?: { name: string; type: string } }) => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {transaction.title || transaction.description}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{moment(transaction.occurred_at).format("lll")}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-red-600">
                      -₹ {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {transaction.accounts?.name} - {transaction.accounts?.type}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{transaction.description}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-red-600">
                      -₹ {transaction.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">{transaction.accounts.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{moment(transaction.transaction_date).format("lll")}</span>
                  </div>
                  <span className="text-sm text-gray-500">{transaction.account}</span>
                </div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="w-8 h-8 text-gray-400" />
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
