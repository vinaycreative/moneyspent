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
  categories?: { name: string; color?: string; icon?: string } | null
  accounts?: { name: string; type: string } | null
  category?: { name: string; color?: string; icon?: string } | null
  account?: { name: string; type: string } | null
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

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(null)
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

  const { accounts } = useAccounts(user?.id || "")

  const transactionParams = useMemo(() => {
    const params: Record<string, unknown> = {}
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
    if (selectedAccountId && selectedAccountId !== "all") params.accountId = selectedAccountId
    if (selectedTransactionType && selectedTransactionType !== "all") params.type = selectedTransactionType
    return params
  }, [selectedDateRange, customStartDate, customEndDate, selectedAccountId, selectedTransactionType])

  const {
    transactions: filteredTransactions,
    totalExpenses,
    totalIncome,
    isLoading: transactionsLoading,
  } = useTransactions(transactionParams, !!user?.id)

  const deleteTransaction = useDeleteTransactionMutation()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchFilteredTransactions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return filteredTransactions
    const query = debouncedSearchQuery.toLowerCase().trim()
    return filteredTransactions?.filter((t: TransactionWithRelations) =>
      t.title.toLowerCase().includes(query) ||
      t.categories?.name?.toLowerCase().includes(query) ||
      t.amount.toString().includes(query)
    )
  }, [filteredTransactions, debouncedSearchQuery])

  const sortedTransactions = useMemo(() => {
    return searchFilteredTransactions?.sort((a: TransactionWithRelations, b: TransactionWithRelations) => {
      const dateA = new Date(a.occurred_at).getTime()
      const dateB = new Date(b.occurred_at).getTime()
      if (dateA !== dateB) return dateB - dateA
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [searchFilteredTransactions])

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
      default: return "All Time"
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
    (t: TransactionWithRelations) => t.id === deleteTransactionId
  )

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Header */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-ink">Transactions</h1>
          <AddTransaction
            trigger={
              <button
                onClick={openDrawer}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: "color-mix(in oklab, var(--ms-accent) 15%, var(--surface))",
                  border: "1px solid color-mix(in oklab, var(--ms-accent) 30%, var(--line))",
                }}
                disabled={transactionsLoading}
              >
                <Plus className="w-5 h-5 text-ms-accent" />
              </button>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-4"
            style={{
              background: "color-mix(in oklab, var(--neg) 10%, var(--surface))",
              border: "1px solid color-mix(in oklab, var(--neg) 20%, var(--line))",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-neg" />
              <div className="text-sm font-medium text-neg">Total Expenses</div>
            </div>
            {transactionsLoading ? (
              <div className="animate-pulse h-6 w-20 rounded" style={{ background: "color-mix(in oklab, var(--neg) 20%, var(--surface))" }}></div>
            ) : (
              <div className="text-xl font-bold text-neg">
                ₹ {totalExpenses.toLocaleString()}
              </div>
            )}
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: "color-mix(in oklab, var(--pos) 10%, var(--surface))",
              border: "1px solid color-mix(in oklab, var(--pos) 20%, var(--line))",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pos" />
              <div className="text-sm font-medium text-pos">Total Income</div>
            </div>
            {transactionsLoading ? (
              <div className="animate-pulse h-6 w-20 rounded" style={{ background: "color-mix(in oklab, var(--pos) 20%, var(--surface))" }}></div>
            ) : (
              <div className="text-xl font-bold text-pos">
                ₹ {totalIncome.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Filter */}
      <div className="px-4">
        <Select value={selectedAccountId} onValueChange={(value) => setSelectedAccountId(value)}>
          <SelectTrigger className="w-full bg-surface border border-line text-ink">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Accounts</SelectLabel>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts?.map((account: ApiAccount) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Type Filter */}
      <div className="px-4">
        <div className="flex gap-2">
          {(["all", "expense", "income"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTransactionType(type)}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: selectedTransactionType === type
                  ? type === "expense" ? "color-mix(in oklab, var(--neg) 15%, var(--surface))"
                  : type === "income" ? "color-mix(in oklab, var(--pos) 15%, var(--surface))"
                  : "color-mix(in oklab, var(--ms-accent) 15%, var(--surface))"
                  : "var(--surface-alt)",
                border: `1px solid ${selectedTransactionType === type
                  ? type === "expense" ? "color-mix(in oklab, var(--neg) 30%, var(--line))"
                  : type === "income" ? "color-mix(in oklab, var(--pos) 30%, var(--line))"
                  : "color-mix(in oklab, var(--ms-accent) 30%, var(--line))"
                  : "var(--line)"}`,
                color: selectedTransactionType === type
                  ? type === "expense" ? "var(--neg)"
                  : type === "income" ? "var(--pos)"
                  : "var(--ms-accent)"
                  : "var(--ms-muted)",
              }}
              disabled={transactionsLoading}
            >
              {type === "expense" && <TrendingDown className="w-3.5 h-3.5 inline mr-1" />}
              {type === "income" && <TrendingUp className="w-3.5 h-3.5 inline mr-1" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="px-4">
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl transition-colors border border-line bg-surface text-ink"
            disabled={transactionsLoading}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ms-muted" />
              <span className="text-sm">{getDateRangeLabel()}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform text-ms-muted ${showDateFilter ? "rotate-180" : ""}`}
            />
          </button>

          {showDateFilter && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 p-3 bg-surface border border-line"
            >
              <div className="space-y-1">
                {["all", "today", "week", "month", "year"].map((range) => (
                  <button
                    key={range}
                    onClick={() => { setSelectedDateRange(range); setShowDateFilter(false) }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: selectedDateRange === range ? "color-mix(in oklab, var(--ms-accent) 15%, var(--surface))" : "transparent",
                      color: selectedDateRange === range ? "var(--ms-accent)" : "var(--ink)",
                    }}
                  >
                    {range === "all" ? "All Time" : range === "today" ? "Today" : range === "week" ? "This Week" : range === "month" ? "This Month" : "This Year"}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
                  <div className="text-sm font-medium mb-2 text-ms-muted">Custom Range</div>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border border-line bg-surface-alt text-ink"
                      disabled={transactionsLoading}
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border border-line bg-surface-alt text-ink"
                      disabled={transactionsLoading}
                    />
                    <button
                      onClick={() => { if (customStartDate && customEndDate) { setSelectedDateRange("custom"); setShowDateFilter(false) } }}
                      className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-ms-accent text-white"
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none bg-surface border border-line text-ink"
            disabled={transactionsLoading}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 pb-6">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-ink">
          {selectedAccountId !== "all" ? sortedTransactions?.length : "All"} Transaction
          {sortedTransactions?.length !== 1 ? "s" : ""}{" "}
          {selectedAccountId === "all" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md ml-auto text-ms-muted bg-surface-alt border border-line">
              Total: {sortedTransactions?.length}
            </span>
          )}
          {selectedAccountId !== "all" && accounts && (
            <span className="text-sm font-normal text-ms-muted">
              from {accounts?.find((a: ApiAccount) => a.id === selectedAccountId)?.name}
            </span>
          )}
          {selectedTransactionType !== "all" && (
            <span className="text-sm font-normal text-ms-muted">
              ({selectedTransactionType === "expense" ? "expenses" : "income"})
            </span>
          )}
          {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
        </h2>

        {transactionsLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse border border-line">
                <div className="w-10 h-10 rounded-lg bg-surface-alt"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded w-3/4 bg-surface-alt"></div>
                  <div className="h-3 rounded w-1/2 bg-surface-alt"></div>
                </div>
                <div className="h-4 rounded w-16 bg-surface-alt"></div>
              </div>
            ))}
          </div>
        ) : sortedTransactions?.length && sortedTransactions?.length > 0 ? (
          <div className="space-y-2">
            {sortedTransactions?.map((transaction: TransactionWithRelations) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer bg-surface border border-line"
                onClick={() => !transactionsLoading && handleOpenEdit(transaction)}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.categories?.color || "bg-gray-400"} text-white font-bold`}
                >
                  {transaction.categories?.icon || "💰"}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-ink">
                    {transaction.title || transaction.description}
                  </div>
                  <div className="text-xs flex items-center gap-1 text-ms-muted">
                    <span className="font-medium">
                      {moment(transaction.occurred_at).tz("Asia/Kolkata").format("DD MMM")}
                    </span>{" "}
                    -
                    <span className="font-medium">{transaction.categories?.name || "Unknown"}</span>
                    -<span className="font-medium">{transaction.accounts?.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`font-medium ${transaction.type === "expense" ? "text-neg" : "text-pos"}`}
                  >
                    {transaction.type === "expense" ? "-" : "+"} ₹{" "}
                    {transaction.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-ms-muted">
                    {moment(transaction.occurred_at).tz("Asia/Kolkata").format("LT")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); !transactionsLoading && handleDeleteClick(transaction.id) }}
                    className="p-2 rounded-lg transition-colors bg-transparent"
                    disabled={transactionsLoading}
                  >
                    <Trash2 className="w-4 h-4 text-neg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-ms-muted">
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

      {selectedTransaction && (
        <EditTransaction
          trigger={<div style={{ display: "none" }}></div>}
          transaction={selectedTransaction}
          onClose={handleCloseEdit}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

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
                <span className="text-sm text-ms-muted">Amount:</span>
                <span
                  className={`font-medium ${transactionToDelete?.type === "expense" ? "text-neg" : "text-pos"}`}
                >
                  {transactionToDelete.type === "expense" ? "-" : "+"} ₹{" "}
                  {transactionToDelete.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Date:</span>
                <span className="font-medium text-ink">
                  {moment(transactionToDelete.occurred_at).tz("Asia/Kolkata").format("lll")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Category:</span>
                <span className="font-medium text-ink">
                  {(transactionToDelete as any)?.category?.name || (transactionToDelete as any)?.categories?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Account:</span>
                <span className="font-medium text-ink">
                  {(transactionToDelete as any)?.account?.name || (transactionToDelete as any)?.accounts?.name || "Unknown"}
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}
