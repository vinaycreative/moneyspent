"use client"

import { useState, useMemo, useEffect } from "react"
import moment from "moment-timezone"
import {
  Search,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Plus,
  X,
  Calendar,
  LayoutList,
  LayoutGrid,
  Check,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth, useTransactions, useAccounts } from "@/hooks"
import { CalendarView } from "@/components/CalendarView"
import { AddExpense } from "@/form/AddExpense"
import { AddIncome } from "@/form/AddIncome"
import { EditTransaction } from "@/form/EditTransaction"
import { Drawer } from "vaul"
import Page from "@/components/layout/Page"
import Header from "@/components/layout/Header"

type ViewMode = "list" | "calendar"

export default function Transactions() {
  const { user, isLoading: authLoading } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filters State
  const [activeType, setActiveType] = useState<"all" | "expense" | "income">("all")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  // Temp State for Drawer
  const [tempAccountId, setTempAccountId] = useState<string>("all")
  const [tempDateRange, setTempDateRange] = useState<string>("all")
  const [tempCustomStart, setTempCustomStart] = useState("")
  const [tempCustomEnd, setTempCustomEnd] = useState("")

  // Sync temp state when drawer opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempAccountId(selectedAccountId)
      setTempDateRange(dateRange)
      setTempCustomStart(customStart)
      setTempCustomEnd(customEnd)
    }
  }, [isFilterOpen, selectedAccountId, dateRange, customStart, customEnd])

  const { accounts } = useAccounts(user?.id || "")

  // Build Transaction Params for API
  const transactionParams = useMemo(() => {
    const params: Record<string, any> = { limit: 1000 }

    if (dateRange === "today") {
      params.startDate = moment().format("YYYY-MM-DD")
      params.endDate = moment().format("YYYY-MM-DD")
    } else if (dateRange === "week") {
      params.startDate = moment().startOf("week").format("YYYY-MM-DD")
      params.endDate = moment().format("YYYY-MM-DD")
    } else if (dateRange === "month") {
      params.startDate = moment().startOf("month").format("YYYY-MM-DD")
      params.endDate = moment().format("YYYY-MM-DD")
    } else if (dateRange === "year") {
      params.startDate = moment().startOf("year").format("YYYY-MM-DD")
      params.endDate = moment().format("YYYY-MM-DD")
    } else if (dateRange === "custom" && customStart && customEnd) {
      params.startDate = customStart
      params.endDate = customEnd
    }

    if (selectedAccountId !== "all") params.accountId = selectedAccountId
    if (activeType !== "all") params.type = activeType

    return params
  }, [dateRange, customStart, customEnd, selectedAccountId, activeType])

  // Get transactions
  const {
    transactions,
    totalExpenses,
    totalIncome,
    isLoading: transactionsLoading,
  } = useTransactions(transactionParams, !!user?.id)

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Filter list by Search Query
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []
    if (!searchQuery) return transactions
    const q = searchQuery.toLowerCase()
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t as any).categories?.name?.toLowerCase().includes(q) ||
        (t as any).accounts?.name?.toLowerCase().includes(q),
    )
  }, [transactions, searchQuery])

  // Group transactions for List View
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, any[]> = {}
    filteredTransactions.forEach((t) => {
      const dateKey = moment(t.occurred_at).tz("Asia/Kolkata").format("YYYY-MM-DD")
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })
    return groups
  }, [filteredTransactions])

  // Transactions for the selected date in Calendar View
  const transactionsForSelectedDate = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((t) =>
      moment(t.occurred_at).tz("Asia/Kolkata").isSame(moment(selectedDate), "day"),
    )
  }, [transactions, selectedDate])

  const hasActiveFilters = selectedAccountId !== "all" || dateRange !== "all"

  const displayDateText = useMemo(() => {
    switch (dateRange) {
      case "all":
        return "All Time"
      case "today":
        return moment().format("dddd, MMM D")
      case "week":
        return `${moment().startOf("week").format("MMM D")} - ${moment().endOf("week").format("MMM D")}`
      case "month":
        return moment().format("MMMM YYYY")
      case "year":
        return moment().format("YYYY")
      case "custom":
        if (customStart && customEnd) {
          return `${moment(customStart).format("MMM D, YYYY")} - ${moment(customEnd).format("MMM D, YYYY")}`
        }
        return "Custom Range"
      default:
        return moment().format("dddd, MMM D")
    }
  }, [dateRange, customStart, customEnd])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent"></div>
      </div>
    )
  }

  return (
    <Page className="overflow-auto space-y-3">
      {/* Header */}
      <Header
        subText={displayDateText}
        mainText="Spending"
        rightComponent={
          <div className="flex items-center gap-2 mt-1">
            <AddExpense
              trigger={
                <button className="h-9 px-3 rounded-full bg-surface border border-line flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm text-ink hover:bg-surface-alt">
                  <ArrowDownRight className="w-4 h-4 text-neg" />
                  <span className="text-[11px] font-bold">Add</span>
                </button>
              }
            />
            <AddIncome
              trigger={
                <button className="h-9 px-3 rounded-full bg-surface border border-line flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm text-ink hover:bg-surface-alt">
                  <ArrowUpRight className="w-4 h-4 text-pos" />
                  <span className="text-[11px] font-bold">Add</span>
                </button>
              }
            />
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 relative ${
                hasActiveFilters
                  ? "bg-ms-warning text-white shadow-lg shadow-ms-warning/20"
                  : "bg-surface border border-line text-ink"
              }`}
            >
              <SlidersHorizontal size={16} />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-paper" />
              )}
            </button>
          </div>
        }
      />
      <section className="pb-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
            <div className="text-[9px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-1.5">
              Spent
            </div>
            <div className="text-xl font-bold text-neg leading-none">
              - ₹{totalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
            <div className="text-[9px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-1.5">
              Earned
            </div>
            <div className="text-xl font-bold text-pos leading-none">
              ₹{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Section Title + View Switchers */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-ink">
              {activeType === "expense"
                ? "Expenses"
                : activeType === "income"
                  ? "Income"
                  : "All Transactions"}
            </h2>
            <p className="text-[11px] text-ms-muted font-medium mt-0.5">
              Found {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          {/* View Toggle Icons */}
          <div className="flex items-center gap-2">
            {/* Type Filters */}
            <div className="flex items-center bg-surface border border-line rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveType("all")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeType === "all"
                    ? "bg-surface-alt text-ink shadow-sm border border-line/50"
                    : "text-ms-muted hover:bg-surface-alt hover:text-ink"
                }`}
                title="All Transactions"
              >
                <span className="text-[10px] font-bold">ALL</span>
              </button>
              <button
                onClick={() => setActiveType("expense")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeType === "expense"
                    ? "bg-neg/10 text-neg"
                    : "text-ms-muted hover:bg-surface-alt hover:text-ink"
                }`}
                title="Filter Expenses"
              >
                <TrendingDown size={15} />
              </button>
              <button
                onClick={() => setActiveType("income")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeType === "income"
                    ? "bg-pos/10 text-pos"
                    : "text-ms-muted hover:bg-surface-alt hover:text-ink"
                }`}
                title="Filter Income"
              >
                <TrendingUp size={15} />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface border border-line rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "list"
                    ? "bg-surface-alt text-ink shadow-sm border border-line/50"
                    : "text-ms-muted hover:text-ink"
                }`}
                title="List View"
              >
                <LayoutList size={15} />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "calendar"
                    ? "bg-surface-alt text-ink shadow-sm border border-line/50"
                    : "text-ms-muted hover:text-ink"
                }`}
                title="Calendar View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm focus:outline-none bg-surface border border-line text-ink placeholder:text-ms-muted shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ms-muted"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {transactionsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-ms-muted opacity-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent mb-3" />
                  <p className="text-xs font-medium">Loading transactions...</p>
                </div>
              ) : Object.keys(groupedTransactions).length > 0 ? (
                <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
                  {Object.keys(groupedTransactions)
                    .sort()
                    .reverse()
                    .map((dateKey, groupIdx) => {
                      const date = moment(dateKey)
                      const isToday = date.isSame(moment(), "day")
                      const isYesterday = date.isSame(moment().subtract(1, "day"), "day")

                      return (
                        <div key={dateKey}>
                          {/* Date Separator */}
                          <div className="px-4 py-2 bg-surface-alt border-b border-line">
                            <span className="text-[10px] font-bold text-ms-muted tracking-wide uppercase">
                              {isToday
                                ? "Today"
                                : isYesterday
                                  ? "Yesterday"
                                  : date.format("DD MMM")}
                              {" · "}
                              {date.format("ddd")}
                            </span>
                          </div>
                          {/* Transactions for this date */}
                          {groupedTransactions[dateKey].map((t, idx) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setSelectedTransaction(t)
                                setIsEditOpen(true)
                              }}
                              className={`flex items-center gap-3 px-4 py-3.5 active:bg-surface-alt transition-colors cursor-pointer ${
                                idx < groupedTransactions[dateKey].length - 1
                                  ? "border-b border-line"
                                  : ""
                              }`}
                            >
                              {/* Icon */}
                              <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                                style={{
                                  backgroundColor: `${(t as any).categories?.color || "#888"}20`,
                                }}
                              >
                                {(t as any).categories?.icon || "💰"}
                              </div>
                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-ink leading-tight truncate">
                                  {t.title}
                                </div>
                                <div className="text-[11px] text-ms-muted font-medium mt-0.5">
                                  {date.format("DD MMM")} · {(t as any).categories?.name} ·{" "}
                                  {(t as any).accounts?.name}
                                </div>
                              </div>
                              {/* Amount + Time */}
                              <div className="text-right flex-shrink-0">
                                <div
                                  className={`font-bold text-sm ${t.type === "expense" ? "text-neg" : "text-pos"}`}
                                >
                                  {t.type === "expense" ? "- " : "+ "}
                                  {t.amount.toLocaleString()} ₹
                                </div>
                                <div className="text-[10px] text-ms-muted font-medium mt-0.5">
                                  {moment(t.occurred_at).tz("Asia/Kolkata").format("hh:mm a")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-ms-muted opacity-40">
                  <Search size={40} className="mb-3" />
                  <p className="text-xs font-medium">No transactions found</p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <CalendarView
                transactions={transactions || []}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              {/* Transactions for selected date */}
              <div>
                <h3 className="text-base font-bold text-ink mb-3">Transactions</h3>
                {transactionsForSelectedDate.length > 0 ? (
                  <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
                    {transactionsForSelectedDate.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTransaction(t)
                          setIsEditOpen(true)
                        }}
                        className="flex items-center gap-3 px-4 py-3.5 active:bg-surface-alt/50 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{
                            backgroundColor: `${(t as any).categories?.color || "#888"}20`,
                          }}
                        >
                          {(t as any).categories?.icon || "💰"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-ink leading-tight truncate">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-ms-muted font-medium mt-0.5">
                            {moment(t.occurred_at).tz("Asia/Kolkata").format("DD MMM")} ·{" "}
                            {(t as any).categories?.name} · {(t as any).accounts?.name}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`font-bold text-sm ${t.type === "expense" ? "text-neg" : "text-pos"}`}
                          >
                            {t.type === "expense" ? "- " : "+ "}
                            {t.amount.toLocaleString()} ₹
                          </div>
                          <div className="text-[10px] text-ms-muted font-medium mt-0.5">
                            {moment(t.occurred_at).tz("Asia/Kolkata").format("hh:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface border border-line rounded-2xl p-8 text-center shadow-sm">
                    <p className="text-xs text-ms-muted font-medium">
                      No transactions on this day
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Filter Drawer */}
      <Drawer.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none"
            style={{ background: "transparent" }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="rounded-t-[32px] overflow-hidden flex flex-col"
              style={{
                background: "#111111", // Premium dark background
                boxShadow: "0 -8px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Top bar */}
              <div className="px-5 pt-4 pb-2">
                <Drawer.Title className="text-[22px] font-bold text-white">Filters</Drawer.Title>
              </div>

              <div className="p-5 flex-1 overflow-y-auto scrollbar-hide pb-8">
                {/* Account Filter */}
                <section className="mb-8">
                  <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">
                    Accounts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTempAccountId("all")}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                        tempAccountId === "all"
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      All
                    </button>
                    {accounts?.map((acc: any) => (
                      <button
                        key={acc.id}
                        onClick={() => setTempAccountId(acc.id)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                          tempAccountId === acc.id
                            ? "bg-white text-black"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {acc.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Date Presets */}
                <section className="mb-8">
                  <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">
                    Time Period
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "all", label: "All time" },
                      { key: "today", label: "Today" },
                      { key: "week", label: "Week" },
                      { key: "month", label: "Month" },
                      { key: "year", label: "Year" },
                      { key: "custom", label: "Custom Range" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTempDateRange(key)}
                        className={`py-4 rounded-2xl text-[14px] font-semibold transition-all border ${
                          tempDateRange === key
                            ? "border-[#7EC8A4] bg-white/10 text-white shadow-[0_0_15px_rgba(126,200,164,0.15)]"
                            : "border-transparent bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Custom Date Inputs */}
                <AnimatePresence>
                  {tempDateRange === "custom" && (
                    <motion.section
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3 pb-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={tempCustomStart}
                            onChange={(e) => setTempCustomStart(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm font-medium text-white focus:border-[#7EC8A4] outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={tempCustomEnd}
                            onChange={(e) => setTempCustomEnd(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm font-medium text-white focus:border-[#7EC8A4] outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-8 pt-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[15px] font-bold text-white bg-white/10 active:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedAccountId(tempAccountId)
                    setDateRange(tempDateRange)
                    setCustomStart(tempCustomStart)
                    setCustomEnd(tempCustomEnd)
                    setIsFilterOpen(false)
                  }}
                  className="flex-1 py-4 rounded-2xl text-[15px] font-bold text-black bg-white active:bg-white/90 transition-colors shadow-lg shadow-white/20"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Edit Drawer */}
      {selectedTransaction && (
        <EditTransaction
          trigger={<div style={{ display: "none" }}></div>}
          transaction={selectedTransaction}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </Page>
  )
}
