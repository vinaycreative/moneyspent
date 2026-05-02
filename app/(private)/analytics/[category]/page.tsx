"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { useAuth, useCategoryTransactions } from "@/hooks"
import { Drawer } from "vaul"
import { motion, AnimatePresence } from "framer-motion"
import moment from "moment-timezone"
import Page from "@/components/layout/Page"

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const category = params.category as string
  const decodedCategory = decodeURIComponent(category)
  const categoryLabel = decodedCategory.replace(/_/g, " ")

  const { data: transactions, isLoading: transactionsLoading } = useCategoryTransactions({
    userId: user?.id || "",
    category: decodedCategory,
    dateRange: selectedDateRange as "today" | "week" | "month" | "year" | "custom" | "all",
    customStartDate: customStartDate || undefined,
    customEndDate: customEndDate || undefined,
    enabled: !!user?.id,
  })

  const totalAmount = (transactions || []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0,
  )

  // Build trend data — last 4 months
  const trendData = useMemo(() => {
    if (!transactions) return []
    const grouped = transactions.reduce((acc: any, t: any) => {
      const month = moment(t.occurred_at).format("MMM")
      if (!acc[month]) acc[month] = 0
      acc[month] += t.amount
      return acc
    }, {})
    const months = []
    for (let i = 3; i >= 0; i--) {
      months.push(moment().subtract(i, "months").format("MMM"))
    }
    return months.map((m, idx) => ({
      month: m,
      amount: grouped[m] || 0,
      isCurrent: idx === months.length - 1,
    }))
  }, [transactions])

  const maxAmount = Math.max(...trendData.map((d) => d.amount), 1)

  const categoryIcon = (transactions as any)?.[0]?.categories?.icon || "💰"

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent" />
      </div>
    )
  }

  const RANGE_LABELS: Record<string, string> = {
    all: "All Time",
    today: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    custom: "Custom Range",
  }

  return (
    <>
      <Page className="overflow-auto">
        <div className="pb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => setShowDateFilter(true)}
            className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Hero */}
        <div className="pb-6 text-center">
          <p className="text-[10px] font-bold text-ms-muted uppercase tracking-[0.15em] mb-2">
            Your Top Category
          </p>
          <h1 className="text-5xl font-black text-ink capitalize tracking-tight mb-4">
            {categoryLabel}
          </h1>
          <p className="text-sm text-ms-muted">
            You spent <span className="font-bold text-ink">₹{totalAmount.toLocaleString()}</span>{" "}
            on {categoryLabel.toLowerCase()} this period.
          </p>
        </div>

        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="bg-surface border border-line rounded-2xl p-5 ">
            <p className="text-[10px] font-bold text-ms-muted uppercase tracking-[0.12em] mb-5">
              {categoryLabel.toUpperCase()} Spend Trend
            </p>

            <div className="h-32 flex items-end justify-between gap-2 relative">
              {/* Baseline */}
              <div className="absolute bottom-7 left-0 right-0 border-b-2 border-line" />

              {trendData.map((data, index) => {
                const pct = data.amount > 0 ? Math.max(5, (data.amount / maxAmount) * 100) : 3
                return (
                  <div key={data.month} className="flex flex-col items-center flex-1 z-10">
                    <div className="w-full h-[100px] flex items-end justify-center">
                      <div
                        className={`w-full max-w-[44px] rounded-t-lg transition-all duration-700 ${
                          data.isCurrent ? "bg-pos" : "bg-surface-alt"
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div
                      className={`text-[11px] font-bold mt-2 ${data.isCurrent ? "text-pos" : "text-ms-muted"}`}
                    >
                      {data.month}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-base font-bold text-ink mb-3">Recent Transactions</h2>

            {transactionsLoading ? (
              <div className="bg-surface border border-line rounded-2xl p-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-11 h-11 rounded-2xl bg-surface-alt shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-1/2 bg-surface-alt" />
                      <div className="h-3 rounded w-1/3 bg-surface-alt" />
                    </div>
                    <div className="h-4 w-14 rounded bg-surface-alt" />
                  </div>
                ))}
              </div>
            ) : (transactions || []).length > 0 ? (
              <div className="bg-surface border border-line rounded-2xl overflow-hidden ">
                {(transactions as any[]).map((t: any, idx: number) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-surface-alt ${
                      idx < (transactions as any[]).length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${t.categories?.color || "#888"}20` }}
                    >
                      {t.categories?.icon || "💰"}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink leading-tight truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-ms-muted font-medium mt-0.5">
                        {moment(t.occurred_at).tz("Asia/Kolkata").format("DD MMM")} ·{" "}
                        {t.accounts?.name} · {t.categories?.name}
                      </div>
                    </div>

                    {/* Amount + time */}
                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold text-sm ${t.type === "income" ? "text-pos" : "text-neg"}`}
                      >
                        {t.type === "income" ? "+ " : "- "}
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
              <div className="bg-surface border border-line rounded-2xl py-10 text-center">
                <p className="text-sm font-medium text-ink">No transactions found</p>
                <p className="text-xs text-ms-muted mt-1">No spending in this period</p>
              </div>
            )}
          </div>
        </div>
      </Page>

      {/* Filter Drawer */}
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
                {(["all", "today", "week", "month", "year"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSelectedDateRange(preset)}
                    className={`py-4 rounded-2xl text-sm font-semibold border transition-all ${
                      selectedDateRange === preset
                        ? "bg-surface-alt border-line text-ink font-bold"
                        : "bg-surface border-line text-ink"
                    }`}
                  >
                    {RANGE_LABELS[preset]}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-8 pt-3 border-t border-line flex gap-3">
              <button
                onClick={() => {
                  setSelectedDateRange("all")
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
