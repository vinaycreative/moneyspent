"use client"

import { useState, useMemo, useEffect } from "react"
import type { ApiAccount } from "@/types/schemas/account.schema"

// Define transaction with relations type
type TransactionWithRelations = {
  id: string
  title: string
  description: string | null
  amount: number
  type: "expense" | "income" | "transfer"
  occurred_at: string
  created_at: string
  categories?: {
    name: string
    color?: string
    icon?: string
  } | null
  accounts?: {
    name: string
    type: string
  } | null
}
import moment from "moment-timezone"
import { Calendar, ChevronDown, TrendingUp, TrendingDown, Search, Trash2 } from "lucide-react"
import { useAddTransactionDrawer } from "@/hooks"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks"
import { useTransactions, useDeleteTransactionMutation, useAccounts } from "@/hooks"
import { DeleteConfirmationSheet } from "@/components/DeleteConfirmationSheet"
import { AddTransaction } from "@/form/AddTransaction"
import { EditTransaction } from "@/form/EditTransaction"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Transactions() {
  const { user, isLoading: authLoading } = useAuth()
  const { openDrawer } = useAddTransactionDrawer()

  // Edit transaction state
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(
    null
  )
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleCloseEdit = () => {
    setSelectedTransaction(null)
    setIsEditOpen(false)
  }

  const handleOpenEdit = (transaction: TransactionWithRelations) => {
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
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const [selectedTransactionType, setSelectedTransactionType] = useState<
    "expense" | "income" | "all"
  >("all")

  // Get accounts for the filter
  const { accounts } = useAccounts(user?.id || "")

  // Get transactions with filtering
  const transactionParams = useMemo(() => {
    const params: Record<string, unknown> = {}

    // Date filtering
    if (selectedDateRange === "today") {
      params.startDate = new Date().toISOString().split("T")[0]
      params.endDate = new Date().toISOString().split("T")[0]
    } else if (selectedDateRange === "week") {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      params.startDate = startOfWeek.toISOString().split("T")[0]
      params.endDate = new Date().toISOString().split("T")[0]
    } else if (selectedDateRange === "month") {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      params.startDate = startOfMonth.toISOString().split("T")[0]
      params.endDate = new Date().toISOString().split("T")[0]
    } else if (selectedDateRange === "year") {
      const today = new Date()
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      params.startDate = startOfYear.toISOString().split("T")[0]
      params.endDate = new Date().toISOString().split("T")[0]
    } else if (selectedDateRange === "custom" && customStartDate && customEndDate) {
      params.startDate = customStartDate
      params.endDate = customEndDate
    }

    // Account filtering
    if (selectedAccountId && selectedAccountId !== "all") {
      params.accountId = selectedAccountId
    }

    // Transaction type filtering
    if (selectedTransactionType && selectedTransactionType !== "all") {
      params.type = selectedTransactionType
    }

    return params
  }, [
    selectedDateRange,
    customStartDate,
    customEndDate,
    selectedAccountId,
    selectedTransactionType,
  ])

  const {
    transactions: filteredTransactions,
    totalExpenses,
    totalIncome,
    isLoading: transactionsLoading,
  } = useTransactions(transactionParams, !!user?.id)

  const deleteTransaction = useDeleteTransactionMutation()
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
    return filteredTransactions?.filter((transaction: TransactionWithRelations) => {
      return (
        transaction.title.toLowerCase().includes(query) ||
        transaction.categories?.name?.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      )
    })
  }, [filteredTransactions, debouncedSearchQuery])

  // Sort transactions by date (newest first) and created_at for better ordering
  const sortedTransactions = useMemo(() => {
    return searchFilteredTransactions?.sort(
      (a: TransactionWithRelations, b: TransactionWithRelations) => {
        // First sort by occurred_at (newest first)
        const dateA = new Date(a.occurred_at).getTime()
        const dateB = new Date(b.occurred_at).getTime()

        if (dateA !== dateB) {
          return dateB - dateA
        }

        // If dates are the same, sort by created_at (newest first)
        const createdA = new Date(a.created_at).getTime()
        const createdB = new Date(b.created_at).getTime()
        return createdB - createdA
      }
    )
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

  const transactionToDelete = sortedTransactions?.find(
    (transaction: TransactionWithRelations) => transaction.id === deleteTransactionId
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
          <div className="bg-red-50 rounded-md p-4 border border-red-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div className="text-sm text-red-600 font-medium">Total Expenses</div>
            </div>
            {transactionsLoading ? (
              <div className="animate-pulse bg-red-200 h-6 w-20 rounded"></div>
            ) : (
              <div className="text-xl font-bold text-red-600">
                ₹ {totalExpenses.toLocaleString()}
              </div>
            )}
          </div>
          <div className="bg-green-50 rounded-md p-4 border border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div className="text-sm text-green-600 font-medium">Total Income</div>
            </div>
            {transactionsLoading ? (
              <div className="animate-pulse bg-green-200 h-6 w-20 rounded"></div>
            ) : (
              <div className="text-xl font-bold text-green-600">
                ₹ {totalIncome.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Filter */}
      <div className="px-4">
        {/* <div className="relative">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            disabled={accountsLoading || transactionsLoading}
          >
            <option value="">All Accounts</option>
            {accounts?.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Wallet className="w-4 h-4 text-gray-400" />
          </div>
        </div> */}
        <Select value={selectedAccountId} onValueChange={(value) => setSelectedAccountId(value)}>
          <SelectTrigger className="w-full border-gray-300 bg-white">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Accounts</SelectLabel>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>All Accounts</span>
                </div>
              </SelectItem>
              {accounts?.map((account: ApiAccount) => {
                return (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      {/* <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs",
                      account.type === "bank" && "bg-blue-500",
                      account.type === "credit" && "bg-red-500",
                      account.type === "cash" && "bg-green-500"
                    )}
                  ></div> */}
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* Account Filter */}

      {/* Transaction Type Filter */}
      <div className="px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTransactionType("all")}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selectedTransactionType === "all"
                ? "bg-purple-100 border-purple-300 text-purple-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={transactionsLoading}
          >
            All
          </button>
          <button
            onClick={() => setSelectedTransactionType("expense")}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selectedTransactionType === "expense"
                ? "bg-red-100 border-red-300 text-red-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={transactionsLoading}
          >
            <TrendingDown className="w-4 h-4 inline mr-1" />
            Expenses
          </button>
          <button
            onClick={() => setSelectedTransactionType("income")}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selectedTransactionType === "income"
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={transactionsLoading}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Income
          </button>
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
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          {selectedAccountId !== "all" ? sortedTransactions?.length : "All"} Transaction
          {sortedTransactions?.length !== 1 ? "s" : ""}{" "}
          {selectedAccountId === "all" && (
            <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-sm border border-gray-200 ml-auto">
              Total: {sortedTransactions?.length}
            </span>
          )}
          {selectedAccountId !== "all" && accounts && (
            <span className="text-sm font-normal text-gray-600">
              from {accounts?.find((a: ApiAccount) => a.id === selectedAccountId)?.name}
            </span>
          )}
          {selectedTransactionType !== "all" && (
            <span className="text-sm font-normal text-gray-600">
              ({selectedTransactionType === "expense" ? "expenses" : "income"})
            </span>
          )}
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
        ) : sortedTransactions?.length && sortedTransactions?.length > 0 ? (
          <div className="space-y-2">
            {sortedTransactions?.map((transaction: TransactionWithRelations) => (
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
                  <div className="font-medium text-black">
                    {transaction.title || transaction.description}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-medium">
                      {moment(transaction.occurred_at).tz("Asia/Kolkata").format("DD MMM")}
                    </span>{" "}
                    -
                    <span className="font-medium">
                      {transaction.categories?.name || "Unknown"}
                    </span>
                    -<span className="font-medium">{transaction.accounts?.name}</span>
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
                    {moment(transaction.occurred_at).tz("Asia/Kolkata").format("LT")}
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
                : selectedAccountId || selectedTransactionType !== "all"
                ? "Try adjusting your date range, filters, or add a new transaction"
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
        itemName={transactionToDelete?.title || transactionToDelete?.description || ""}
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
                    transactionToDelete?.type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {transactionToDelete.type === "expense" ? "-" : "+"} ₹{" "}
                  {transactionToDelete.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {moment(transactionToDelete.occurred_at).tz("Asia/Kolkata").format("lll")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">
                  {transactionToDelete?.category?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account:</span>
                <span className="font-medium text-gray-900">
                  {transactionToDelete?.account?.name || "Unknown"}
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}
