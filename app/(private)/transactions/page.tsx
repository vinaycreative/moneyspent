"use client"

import { useState, useMemo } from "react"
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
  Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth, useTransactions, useAccounts } from "@/hooks"
import { CalendarView } from "@/components/CalendarView"
import { AddTransaction } from "@/form/AddTransaction"
import { EditTransaction } from "@/form/EditTransaction"
import { Drawer } from "vaul"

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
    isLoading: transactionsLoading 
  } = useTransactions(transactionParams, !!user?.id)

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Filter list by Search Query
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []
    if (!searchQuery) return transactions
    const q = searchQuery.toLowerCase()
    return transactions.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t as any).categories?.name?.toLowerCase().includes(q) ||
      (t as any).accounts?.name?.toLowerCase().includes(q)
    )
  }, [transactions, searchQuery])

  // Group transactions for List View
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, any[]> = {}
    filteredTransactions.forEach(t => {
      const dateKey = moment(t.occurred_at).tz("Asia/Kolkata").format("YYYY-MM-DD")
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })
    return groups
  }, [filteredTransactions])

  // Transactions for the selected date in Calendar View
  const transactionsForSelectedDate = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(t => 
      moment(t.occurred_at).tz("Asia/Kolkata").isSame(moment(selectedDate), 'day')
    )
  }, [transactions, selectedDate])

  const hasActiveFilters = selectedAccountId !== "all" || dateRange !== "all"

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col pt-6 mobile-viewport bg-paper overflow-hidden">
      {/* Header */}
      <header className="px-5 pb-4 space-y-4">
        {/* Top Row: Date + Filter Icon */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-ms-muted font-medium mb-0.5">
              {moment().format("dddd, MMM D")}
            </p>
            <h1 className="text-3xl font-bold text-ink tracking-tight">Spending</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <AddTransaction
              trigger={
                <button className="w-9 h-9 rounded-full bg-ms-warning text-white flex items-center justify-center shadow-lg shadow-ms-warning/20 transition-transform active:scale-95">
                  <Plus size={20} />
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
            <div className="text-[9px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-1.5">Spent</div>
            <div className="text-xl font-bold text-neg leading-none">
              - ₹{totalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
            <div className="text-[9px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-1.5">Earned</div>
            <div className="text-xl font-bold text-pos leading-none">
              ₹{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Section Title + View Switchers */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-ink">All Transactions</h2>
            <p className="text-[11px] text-ms-muted font-medium mt-0.5">
              Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          {/* View Toggle Icons */}
          <div className="flex items-center gap-1 bg-surface border border-line rounded-xl p-1 shadow-sm">
            <button
              onClick={() => { setActiveType("expense"); setViewMode("list") }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeType === "expense" && viewMode === "list"
                  ? "bg-neg/10 text-neg" 
                  : "text-ms-muted hover:text-ink"
              }`}
            >
              <TrendingDown size={15} />
            </button>
            <button
              onClick={() => { setActiveType("income"); setViewMode("list") }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeType === "income" && viewMode === "list"
                  ? "bg-pos/10 text-pos" 
                  : "text-ms-muted hover:text-ink"
              }`}
            >
              <TrendingUp size={15} />
            </button>
            <button
              onClick={() => { setActiveType("all"); setViewMode("list") }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list" && activeType === "all"
                  ? "bg-surface-alt text-ink" 
                  : "text-ms-muted hover:text-ink"
              }`}
            >
              <LayoutList size={15} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "calendar"
                  ? "bg-surface-alt text-ink" 
                  : "text-ms-muted hover:text-ink"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
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
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ms-muted">
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
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
                  {Object.keys(groupedTransactions).sort().reverse().map((dateKey, groupIdx) => {
                    const date = moment(dateKey)
                    const isToday = date.isSame(moment(), 'day')
                    const isYesterday = date.isSame(moment().subtract(1, 'day'), 'day')

                    return (
                      <div key={dateKey}>
                        {/* Date Separator */}
                        <div className="px-4 py-2 bg-surface-alt border-b border-line">
                          <span className="text-[10px] font-bold text-ms-muted tracking-wide uppercase">
                            {isToday ? "Today" : isYesterday ? "Yesterday" : date.format("DD MMM")}
                            {" · "}
                            {date.format("ddd")}
                          </span>
                        </div>
                        {/* Transactions for this date */}
                        {groupedTransactions[dateKey].map((t, idx) => (
                          <div 
                            key={t.id} 
                            onClick={() => { setSelectedTransaction(t); setIsEditOpen(true) }}
                            className={`flex items-center gap-3 px-4 py-3.5 active:bg-surface-alt transition-colors cursor-pointer ${
                              idx < groupedTransactions[dateKey].length - 1 ? "border-b border-line" : ""
                            }`}
                          >
                            {/* Icon */}
                            <div 
                              className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ backgroundColor: `${(t as any).categories?.color || "#888"}20` }}
                            >
                              {(t as any).categories?.icon || "💰"}
                            </div>
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-ink leading-tight truncate">{t.title}</div>
                              <div className="text-[11px] text-ms-muted font-medium mt-0.5">
                                {date.format("DD MMM")} · {(t as any).categories?.name} · {(t as any).accounts?.name}
                              </div>
                            </div>
                            {/* Amount + Time */}
                            <div className="text-right flex-shrink-0">
                              <div className={`font-bold text-sm ${t.type === 'expense' ? "text-neg" : "text-pos"}`}>
                                {t.type === 'expense' ? "- " : "+ "}{t.amount.toLocaleString()} ₹
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
                        onClick={() => { setSelectedTransaction(t); setIsEditOpen(true) }}
                        className="flex items-center gap-3 px-4 py-3.5 active:bg-surface-alt/50 transition-colors cursor-pointer"
                      >
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${(t as any).categories?.color || "#888"}20` }}
                        >
                          {(t as any).categories?.icon || "💰"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-ink leading-tight truncate">{t.title}</div>
                          <div className="text-[11px] text-ms-muted font-medium mt-0.5">
                            {moment(t.occurred_at).tz("Asia/Kolkata").format("DD MMM")} · {(t as any).categories?.name} · {(t as any).accounts?.name}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`font-bold text-sm ${t.type === 'expense' ? "text-neg" : "text-pos"}`}>
                            {t.type === 'expense' ? "- " : "+ "}{t.amount.toLocaleString()} ₹
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
                    <p className="text-xs text-ms-muted font-medium">No transactions on this day</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Filter Drawer */}
      <Drawer.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none shadow-2xl">
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
              {/* Handle */}
              <div className="mx-auto w-10 h-1 flex-shrink-0 rounded-full bg-line mb-6" />
              
              <Drawer.Title className="text-xl font-bold text-ink mb-6 px-1">Filters</Drawer.Title>

              {/* Account Filter */}
              <section className="mb-6">
                <h4 className="text-[10px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-3 px-1">Accounts</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setSelectedAccountId("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      selectedAccountId === "all" 
                        ? "bg-ink text-paper border-ink" 
                        : "bg-surface-alt border-line text-ink"
                    }`}
                  >
                    All
                  </button>
                  {accounts?.map((acc: any) => (
                    <button 
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        selectedAccountId === acc.id 
                          ? "bg-ink text-paper border-ink" 
                          : "bg-surface-alt border-line text-ink"
                      }`}
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Date Presets */}
              <section className="mb-6">
                <h4 className="text-[10px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-3 px-1">Time Period</h4>
                <div className="grid grid-cols-2 gap-2.5">
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
                      onClick={() => setDateRange(key)}
                      className={`py-4 rounded-2xl text-sm font-semibold transition-all border ${
                        dateRange === key 
                          ? "bg-surface-alt border-line text-ink font-bold" 
                          : "bg-surface border-line text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Custom Date Inputs */}
              <AnimatePresence>
                {dateRange === "custom" && (
                  <motion.section 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mb-6 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-ms-muted uppercase px-1">Start Date</label>
                      <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-surface-alt border border-line rounded-2xl p-3 text-sm text-ink focus:border-ms-warning outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-ms-muted uppercase px-1">End Date</label>
                      <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-surface-alt border border-line rounded-2xl p-3 text-sm text-ink focus:border-ms-warning outline-none"
                      />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
            
            {/* Action Buttons */}
            <div className="px-5 pb-8 pt-4 flex gap-3 border-t border-line">
              <button 
                onClick={() => {
                  setSelectedAccountId("all")
                  setDateRange("all")
                  setActiveType("all")
                  setIsFilterOpen(false)
                }}
                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-ink bg-surface-alt border border-line active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-white bg-ink active:scale-98 transition-transform"
              >
                Apply
              </button>
            </div>
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
    </div>
  )
}
