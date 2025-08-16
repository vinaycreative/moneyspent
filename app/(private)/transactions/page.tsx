"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import moment from "moment-timezone"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  Filter,
  TrendingUp,
  TrendingDown,
  Search,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { ReusableDrawer } from "@/components/ReusableDrawer"
import { AddTransactionFormContent } from "@/components/AddTransactionFormContent"
import { useAddTransactionDrawer } from "@/lib/hooks/use-add-transaction-drawer"
import { Plus } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useFilteredTransactions, useTransactionSummary, useDeleteTransaction } from "@/lib/hooks"
import { DeleteConfirmationSheet } from "@/components/DeleteConfirmationSheet"
import { AddTransaction } from "@/form/AddTransaction"
import { EditTransaction } from "@/form/EditTransaction"

export default function Transactions() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    isOpen,
    openDrawer,
    closeDrawer,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: isSubmitting,
  } = useAddTransactionDrawer()

  // Edit transaction state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleCloseEdit = () => {
    setSelectedTransaction(null)
    setIsEditOpen(false)
  }

  const handleOpenEdit = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsEditOpen(true)
  }

  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Get filtered transactions based on date range
  const {
    transactions: filteredTransactions,
    totalExpenses,
    totalIncome,
    netSavings,
    isLoading: transactionsLoading,
  } = useFilteredTransactions({
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

  const deleteTransaction = useDeleteTransaction()

  // Debounce search query to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter transactions by search query
  const searchFilteredTransactions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return filteredTransactions

    const query = debouncedSearchQuery.toLowerCase().trim()
    return filteredTransactions.filter((transaction: any) => {
      return (
        transaction.title.toLowerCase().includes(query) ||
        transaction.categories?.name?.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      )
    })
  }, [filteredTransactions, debouncedSearchQuery])

  // Sort transactions by date (newest first) and created_at for better ordering
  const sortedTransactions = useMemo(() => {
    return searchFilteredTransactions.sort((a: any, b: any) => {
      // First sort by transaction_date (newest first)
      const dateA = new Date(a.transaction_date).getTime()
      const dateB = new Date(b.transaction_date).getTime()

      if (dateA !== dateB) {
        return dateB - dateA
      }

      // If dates are the same, sort by created_at (newest first)
      const createdA = new Date(a.created_at).getTime()
      const createdB = new Date(b.created_at).getTime()
      return createdB - createdA
    })
  }, [searchFilteredTransactions])

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
        return "All Time"
    }
  }

  const handleDeleteClick = (transactionId: string) => {
    setDeleteTransactionId(transactionId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTransactionId) return

    try {
      await deleteTransaction.mutateAsync(deleteTransactionId)
      setShowDeleteConfirm(false)
      setDeleteTransactionId(null)
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
  }

  const transactionToDelete = sortedTransactions.find(
    (transaction: any) => transaction.id === deleteTransactionId
  )

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Header */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
          <AddTransaction
            trigger={
              <button
                onClick={openDrawer}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
                disabled={transactionsLoading}
              >
                <Plus className="w-5 h-5 text-purple-600" />
              </button>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div className="text-sm text-red-600 font-medium">Total Expenses</div>
            </div>
            {summaryLoading ? (
              <div className="animate-pulse bg-red-200 h-6 w-20 rounded"></div>
            ) : (
              <div className="text-xl font-bold text-red-600">
                ₹ {totalExpenses.toLocaleString()}
              </div>
            )}
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div className="text-sm text-green-600 font-medium">Total Income</div>
            </div>
            {summaryLoading ? (
              <div className="animate-pulse bg-green-200 h-6 w-20 rounded"></div>
            ) : (
              <div className="text-xl font-bold text-green-600">
                ₹ {totalIncome.toLocaleString()}
              </div>
            )}
          </div>
          {/* Net Savings Card */}
          <div className="col-span-2">
            <div
              className={`rounded-xl p-4 border ${
                netSavings >= 0 ? "bg-blue-50 border-blue-300" : "bg-orange-50 border-orange-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    netSavings >= 0 ? "bg-blue-500" : "bg-orange-500"
                  }`}
                ></div>
                <div
                  className={`text-sm font-medium ${
                    netSavings >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  Net Savings
                </div>
              </div>
              {summaryLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
              ) : (
                <div
                  className={`text-xl font-bold ${
                    netSavings >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  ₹ {netSavings.toLocaleString()}
                </div>
              )}
              <div
                className={`text-xs mt-1 ${netSavings >= 0 ? "text-blue-500" : "text-orange-500"}`}
              >
                {netSavings >= 0 ? "You're saving well!" : "You're spending more than earning"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="px-4">
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            disabled={transactionsLoading}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{getDateRangeLabel()}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showDateFilter ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDateFilter && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedDateRange("all")
                    setShowDateFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDateRange === "all"
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => {
                    setSelectedDateRange("today")
                    setShowDateFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDateRange === "today"
                      ? "bg-purple-100 text-purple-700"
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
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDateRange === "week"
                      ? "bg-purple-100 text-purple-700"
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
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDateRange === "month"
                      ? "bg-purple-100 text-purple-700"
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
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDateRange === "year"
                      ? "bg-purple-100 text-purple-700"
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
                      disabled={transactionsLoading}
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="End Date"
                      disabled={transactionsLoading}
                    />
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          setSelectedDateRange("custom")
                          setShowDateFilter(false)
                        }
                      }}
                      className="w-full px-3 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                      disabled={transactionsLoading}
                    >
                      Apply Custom Range
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={transactionsLoading}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {sortedTransactions.length} Transaction{sortedTransactions.length !== 1 ? "s" : ""}
          {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
        </h2>

        {transactionsLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg animate-pulse border border-gray-200"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : sortedTransactions.length > 0 ? (
          <div className="space-y-2">
            {sortedTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center bg-white gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                onClick={() => !transactionsLoading && handleOpenEdit(transaction)}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.categories?.color || "bg-gray-400"
                  } text-white font-bold`}
                >
                  {transaction.categories?.icon || "💰"}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-black">{transaction.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-medium">
                      {moment(transaction.transaction_date).tz("Asia/Kolkata").format("DD MMM")}
                    </span>{" "}
                    - <span className="font-medium">{transaction.accounts?.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`font-medium ${
                      transaction.type === "expense" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"} ₹{" "}
                    {transaction.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {" "}
                    {moment(transaction.transaction_date).tz("Asia/Kolkata").format("LT")}
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      !transactionsLoading && handleDeleteClick(transaction.id)
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={transactionsLoading}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">
              {searchQuery ? "No matching transactions" : "No transactions found"}
            </div>
            <div className="text-sm">
              {searchQuery
                ? "Try adjusting your search terms or date range"
                : "Try adjusting your date range or add a new transaction"}
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Form */}
      {selectedTransaction && (
        <EditTransaction
          trigger={<div style={{ display: "none" }}></div>}
          transaction={selectedTransaction}
          onClose={handleCloseEdit}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      {/* Delete Confirmation Sheet */}
      <DeleteConfirmationSheet
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Transaction"
        description="Are you sure you want to delete"
        itemName={transactionToDelete?.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isPending={deleteTransaction.isPending}
        confirmText="Delete Transaction"
        additionalDetails={
          transactionToDelete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span
                  className={`font-medium ${
                    transactionToDelete.type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {transactionToDelete.type === "expense" ? "-" : "+"} ₹{" "}
                  {transactionToDelete.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {moment(transactionToDelete.transaction_date).tz("Asia/Kolkata").format("lll")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">
                  {transactionToDelete.categories?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account:</span>
                <span className="font-medium text-gray-900">
                  {transactionToDelete.accounts?.name || "Unknown"}
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}
