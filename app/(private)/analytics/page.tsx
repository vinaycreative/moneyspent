"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SlidersHorizontal, TrendingUp, TrendingDown, Check, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer } from "vaul"
import { useAuth, useAnalytics } from "@/hooks"
import moment from "moment"
import Page from "@/components/layout/Page"
import Header from "@/components/layout/Header"

export default function Analytics() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [selectedDateRange, setSelectedDateRange] = useState<
    "all" | "today" | "week" | "month" | "year" | "custom"
  >("all")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showAllCategories, setShowAllCategories] = useState(false)

  const {
    expenseCategories,
    totalExpenses,
    totalIncome,
    netSavings,
    monthlyTrend,
    isLoading: analyticsLoading,
  } = useAnalytics({
    userId: user?.id || "",
    dateRange: selectedDateRange,
    customStartDate: customStartDate || undefined,
    customEndDate: customEndDate || undefined,
    enabled: !!user?.id,
  })

  // Build trend bars from the already-filtered monthlyTrend
  const trendBars = useMemo(() => {
    const filtered = monthlyTrend.filter((m) => m.amount > 0)
    const source = filtered.length > 0 ? filtered : monthlyTrend
    const max = Math.max(...source.map((m) => m.amount), 1)
    const currentMonth = moment().format("MMM")
    return source.map((m) => ({
      ...m,
      isCurrent: m.month === currentMonth,
      pct: m.amount > 0 ? Math.max(5, (m.amount / max) * 100) : 3,
    }))
  }, [monthlyTrend])

  const RANGE_LABELS: Record<string, string> = {
    all: "All Time",
    today: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    custom: "Custom Range",
  }

  const visibleCategories = showAllCategories ? expenseCategories : expenseCategories.slice(0, 4)

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Page className="space-y-4 overflow-auto">
        <Header
          subText={moment().format("MMMM D")}
          mainText="Analytics"
          rightComponent={
            <button
              onClick={() => setShowDateFilter(true)}
              className={`mt-1 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                selectedDateRange !== "month"
                  ? "bg-ms-accent text-white shadow-lg"
                  : "bg-surface border border-line text-ink"
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          }
        />

        <div className="flex flex-col gap-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Spent */}
            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-1.5">
                Spent
              </p>
              {analyticsLoading ? (
                <div className="h-7 w-20 rounded-lg bg-surface-alt animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-ink leading-none">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* Income */}
            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-1.5">
                Income
              </p>
              {analyticsLoading ? (
                <div className="h-7 w-20 rounded-lg bg-surface-alt animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-pos leading-none">
                  ₹{totalIncome.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* Savings - full width */}
            <div className="col-span-2 bg-surface border border-line rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-1.5">
                  Save
                </p>
                {analyticsLoading ? (
                  <div className="h-7 w-28 rounded-lg bg-surface-alt animate-pulse" />
                ) : (
                  <p
                    className={`text-xl font-bold leading-none ${netSavings >= 0 ? "text-pos" : "text-neg"}`}
                  >
                    ₹{Math.abs(netSavings).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <div className="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center">
                {netSavings >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-pos" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-neg" />
                )}
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <div className="mb-3">
              <h2 className="text-base font-bold text-ink">Top Categories</h2>
              <p className="text-[11px] text-ms-muted font-medium mt-0.5">
                Breakdown of your expenses
              </p>
            </div>

            {analyticsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-surface border border-line rounded-2xl p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-alt shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 w-24 rounded bg-surface-alt" />
                          <div className="h-4 w-16 rounded bg-surface-alt" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-3 w-20 rounded bg-surface-alt" />
                          <div className="h-3 w-10 rounded bg-surface-alt" />
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-alt" />
                  </div>
                ))}
              </div>
            ) : expenseCategories.length > 0 ? (
              <>
                <div className="space-y-2">
                  <AnimatePresence>
                    {visibleCategories.map((cat: any, idx: number) => (
                      <motion.button
                        key={cat.category}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() =>
                          router.push(
                            `/analytics/${encodeURIComponent(cat.category.toLowerCase())}`,
                          )
                        }
                        className="w-full bg-surface border border-line rounded-2xl p-4 shadow-sm active:bg-surface-alt transition-colors text-left"
                      >
                        {/* Content Header */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-2xl shrink-0">
                            {cat.icon || "💰"}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-base font-bold text-ink capitalize">
                                {cat.category.replace(/_/g, " ")}
                              </p>
                              <p className="text-base font-bold text-ink">
                                ₹{Number(cat.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-ms-muted font-medium">
                                {cat.count ?? 0} transaction{(cat.count ?? 0) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs font-bold text-ink">
                                {Number(cat.percentage ?? 0).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                          <div
                            className="h-full rounded-full bg-ink transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(2, cat.percentage)}%` }}
                          />
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                {/* See more / less */}
                {expenseCategories.length > 4 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="mt-2 w-full py-4 rounded-2xl bg-surface border border-line text-sm font-semibold text-ms-muted flex items-center justify-center gap-2 active:bg-surface-alt transition-colors"
                  >
                    {showAllCategories ? "Show less" : "See more"}
                    <ArrowRight
                      size={14}
                      className={`transition-transform ${showAllCategories ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </>
            ) : (
              <div className="bg-surface border border-line rounded-2xl py-12 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-ink">No expenses yet</p>
                <p className="text-xs text-ms-muted mt-1">Add transactions to see breakdown</p>
              </div>
            )}
          </div>

          {/* Spending Trend */}
          <div>
            <div className="mb-3">
              <h2 className="text-base font-bold text-ink">Spending Trend</h2>
              <p className="text-[11px] text-ms-muted font-medium mt-0.5">
                {RANGE_LABELS[selectedDateRange]}
              </p>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm space-y-2">
              {trendBars.map((bar, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold w-8 shrink-0 ${bar.isCurrent ? "text-ink" : "text-ms-muted"}`}
                  >
                    {bar.month}
                    {bar.isCurrent ? "*" : ""}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
                    <div
                      className="h-full rounded-full bg-pos transition-all duration-700"
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold w-16 text-right shrink-0 ${bar.isCurrent ? "text-ink" : "text-ms-muted"}`}
                  >
                    {bar.amount > 0
                      ? bar.amount >= 1000
                        ? `₹ ${(bar.amount / 1000).toFixed(1)}k`
                        : `₹ ${bar.amount}`
                      : "—"}
                  </span>
                </div>
              ))}
              <p className="text-[10px] text-ms-muted pt-1">* Current month</p>
            </div>
          </div>
        </div>
      </Page>

      {/* Date Filter Drawer */}
      <Drawer.Root open={showDateFilter} onOpenChange={setShowDateFilter}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none shadow-2xl">
            <div className="p-5">
              <div className="mx-auto w-10 h-1 rounded-full bg-line mb-6" />
              <Drawer.Title className="text-xl font-bold text-ink mb-5 px-1">
                Time Period
              </Drawer.Title>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {(["all", "today", "week", "month", "year", "custom"] as const).map((preset) => {
                  const active = selectedDateRange === preset
                  return (
                    <button
                      key={preset}
                      onClick={() => setSelectedDateRange(preset)}
                      className={`py-4 rounded-2xl text-sm font-semibold flex items-center justify-between px-4 border transition-all ${
                        active
                          ? "bg-surface-alt border-line text-ink font-bold"
                          : "bg-surface border-line text-ink"
                      }`}
                    >
                      <span>{RANGE_LABELS[preset]}</span>
                      {active && <Check size={13} />}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence>
                {selectedDateRange === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3 mb-2"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-ms-muted uppercase tracking-widest block mb-1.5 px-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-surface-alt border border-line rounded-2xl px-4 py-3 text-sm text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-ms-muted uppercase tracking-widest block mb-1.5 px-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-surface-alt border border-line rounded-2xl px-4 py-3 text-sm text-ink outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-5 pb-8 pt-3 border-t border-line flex gap-3">
              <button
                onClick={() => {
                  setSelectedDateRange("month")
                  setShowDateFilter(false)
                }}
                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-ink bg-surface-alt border border-line active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDateFilter(false)}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-paper bg-ink active:scale-95 transition-transform"
              >
                Apply
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
