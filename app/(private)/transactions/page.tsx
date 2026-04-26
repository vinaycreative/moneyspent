"use client"

import { useState, useMemo, useEffect } from "react"
import moment from "moment-timezone"
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Filter as FilterIcon,
  Plus,
  X,
  Calendar,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
      t.categories?.name?.toLowerCase().includes(q) ||
      t.category?.name?.toLowerCase().includes(q)
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

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent"></div>
      </div>
    )
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "all": return "All Time"
      case "today": return "Today"
      case "week": return "This Week"
      case "month": return "This Month"
      case "year": return "This Year"
      case "custom": return "Custom"
      default: return "Filter"
    }
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col mobile-viewport bg-paper overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-8 pb-3 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Spending</h1>
            <p className="text-[10px] text-ms-muted font-bold mt-0.5 uppercase tracking-wider opacity-70">
              {getDateRangeLabel()} · ₹{totalExpenses.toLocaleString()} spent
            </p>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsSearchOpen(!isSearchOpen)}
               className="w-9 h-9 rounded-full bg-surface-alt border border-line flex items-center justify-center text-ink transition-transform active:scale-95"
             >
               <Search size={16} />
             </button>
             <AddTransaction
               trigger={
                 <button className="w-9 h-9 rounded-full bg-ms-warning text-white flex items-center justify-center shadow-lg shadow-ms-warning/20 transition-transform active:scale-95">
                   <Plus size={20} />
                 </button>
               }
             />
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ms-muted" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none bg-surface-alt border border-line text-ink"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ms-muted">
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-alt border border-line/50 rounded-2xl p-3 shadow-sm">
            <div className="text-[8px] font-bold text-ms-muted uppercase tracking-[0.1em] mb-0.5 opacity-60">Spent</div>
            <div className="text-base font-bold text-ink">
              -₹{totalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="bg-surface-alt border border-line/50 rounded-2xl p-3 shadow-sm">
            <div className="text-[8px] font-bold text-ms-muted uppercase tracking-[0.1em] mb-0.5 opacity-60">Earned</div>
            <div className="text-base font-bold text-pos">
              +₹{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex p-1 bg-surface-alt border border-line rounded-xl">
          {(["list", "calendar"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold capitalize transition-all ${
                viewMode === mode 
                  ? "bg-surface text-ink shadow-sm border border-line" 
                  : "text-ms-muted hover:text-ink"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar items-center">
          <button 
            onClick={() => setActiveType("all")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors whitespace-nowrap ${
              activeType === "all" ? "bg-ink text-paper border-ink" : "bg-surface border-line text-ms-muted"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveType("expense")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeType === "expense" ? "bg-ink text-paper border-ink" : "bg-surface border-line text-ms-muted"
            }`}
          >
            <TrendingDown size={11} /> Spend
          </button>
          <button 
            onClick={() => setActiveType("income")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeType === "income" ? "bg-ink text-paper border-ink" : "bg-surface border-line text-ms-muted"
            }`}
          >
            <TrendingUp size={11} /> Income
          </button>
          
          <div className="w-px h-3 bg-line self-center mx-1" />
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap flex items-center gap-1 transition-colors ${
              (selectedAccountId !== "all" || dateRange !== "all") ? "bg-ms-warning text-white border-ms-warning" : "bg-surface border-line text-ms-muted"
            }`}
          >
            <FilterIcon size={11} /> Filter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        <AnimatePresence mode="wait">
          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 mt-1"
            >
              {Object.keys(groupedTransactions).length > 0 ? (
                Object.keys(groupedTransactions).sort().reverse().map((dateKey) => {
                  const date = moment(dateKey)
                  const isToday = date.isSame(moment(), 'day')
                  const isYesterday = date.isSame(moment().subtract(1, 'day'), 'day')
                  const label = isToday ? "TODAY" : isYesterday ? "YESTERDAY" : date.format("ddd").toUpperCase()
                  const fullDate = date.format("MMM D")
                  const dayTotal = groupedTransactions[dateKey].reduce((sum, t) => 
                    t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
                  )

                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className="flex justify-between items-end px-1">
                        <div className="text-[9px] font-bold text-ms-muted tracking-[0.1em]">
                          {label} · {fullDate}
                        </div>
                        <div className={`text-[9px] font-bold tracking-tight ${dayTotal < 0 ? "text-ink" : "text-pos"}`}>
                          {dayTotal < 0 ? "-" : "+"}₹{Math.abs(dayTotal).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm divide-y divide-line/50">
                        {groupedTransactions[dateKey].map((t) => (
                          <div 
                            key={t.id} 
                            onClick={() => { setSelectedTransaction(t); setIsEditOpen(true) }}
                            className="flex items-center gap-3 p-3 active:bg-surface-alt transition-colors"
                          >
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm"
                              style={{ backgroundColor: `${t.categories?.color || t.category?.color}20` }}
                            >
                              {t.categories?.icon || t.category?.icon || "💰"}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-ink leading-tight mb-0.5">{t.title}</div>
                              <div className="text-[10px] text-ms-muted font-medium opacity-70">
                                {t.categories?.name || t.category?.name} · {t.accounts?.name || t.account?.name}
                              </div>
                            </div>
                            <div className={`font-bold text-sm ${t.type === 'expense' ? "text-ink" : "text-pos"}`}>
                              {t.type === 'expense' ? "-" : "+"}₹{t.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
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
              className="space-y-5 mt-1"
            >
              <CalendarView 
                transactions={transactions || []} 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <div className="text-[9px] font-bold text-ms-muted tracking-[0.1em]">
                    {moment(selectedDate).format("ddd · MMM D").toUpperCase()}
                  </div>
                </div>
                <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm divide-y divide-line/50">
                  {transactionsForSelectedDate.length > 0 ? (
                    transactionsForSelectedDate.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedTransaction(t); setIsEditOpen(true) }}
                        className="flex items-center gap-3 p-3 active:bg-surface-alt transition-colors"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm"
                          style={{ backgroundColor: `${t.categories?.color || t.category?.color}20` }}
                        >
                          {t.categories?.icon || t.category?.icon || "💰"}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-ink leading-tight mb-0.5">{t.title}</div>
                          <div className="text-[10px] text-ms-muted font-medium opacity-70">
                            {t.categories?.name || t.category?.name} · {t.accounts?.name || t.account?.name}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${t.type === 'expense' ? "text-ink" : "text-pos"}`}>
                          {t.type === 'expense' ? "-" : "+"}₹{t.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-ms-muted font-medium">
                      No transactions on this day
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Filter Modal */}
      <Drawer.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none">
            <div className="p-4 bg-paper rounded-t-[32px] flex-1 overflow-y-auto no-scrollbar">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-line mb-8" />
              <div className="px-2">
                <Drawer.Title className="text-2xl font-bold text-ink mb-6">Filter</Drawer.Title>
                
                {/* Account Filter */}
                <section className="mb-8">
                  <h4 className="text-[10px] font-bold text-ms-muted uppercase tracking-wider mb-3 px-1">Accounts</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedAccountId("all")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedAccountId === "all" ? "bg-ink text-paper border-ink" : "bg-surface-alt border-line text-ms-muted"
                      }`}
                    >
                      All
                    </button>
                    {accounts?.map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedAccountId === acc.id ? "bg-ink text-paper border-ink" : "bg-surface-alt border-line text-ms-muted"
                        }`}
                      >
                        {acc.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Date Presets */}
                <section className="mb-8">
                  <h4 className="text-[10px] font-bold text-ms-muted uppercase tracking-wider mb-3 px-1">Time Period</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["all", "today", "week", "month", "year"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setDateRange(preset)}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between ${
                          dateRange === preset ? "bg-ms-warning/10 border-ms-warning text-ms-warning" : "bg-surface-alt border-line text-ms-muted"
                        }`}
                      >
                        <span className="capitalize">{preset === "all" ? "All Time" : preset}</span>
                        {dateRange === preset && <Check size={14} />}
                      </button>
                    ))}
                    <button
                      onClick={() => setDateRange("custom")}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between ${
                        dateRange === "custom" ? "bg-ms-warning/10 border-ms-warning text-ms-warning" : "bg-surface-alt border-line text-ms-muted"
                      }`}
                    >
                      <span>Custom Range</span>
                      {dateRange === "custom" && <Calendar size={14} />}
                    </button>
                  </div>
                </section>

                {/* Custom Date Inputs */}
                <AnimatePresence>
                  {dateRange === "custom" && (
                    <motion.section 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mb-8 overflow-hidden"
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
            </div>
            
            {/* Action Buttons */}
            <div className="p-6 bg-paper border-t border-line flex gap-3">
              <button 
                onClick={() => {
                  setSelectedAccountId("all")
                  setDateRange("all")
                  setActiveType("all")
                  setIsFilterOpen(false)
                }}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-ms-muted bg-surface-alt hover:bg-line transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-white bg-ms-warning shadow-lg shadow-ms-warning/20 active:scale-95 transition-transform"
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
