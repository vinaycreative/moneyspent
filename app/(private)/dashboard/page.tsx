"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight, ChevronRight as ChevRight, Settings } from "lucide-react"
import { DashboardStats } from "@/components/DashboardStats"
import { useAuth } from "@/hooks"
import { useTransactions } from "@/hooks"
import moment from "moment-timezone"
import { AddTransaction } from "@/form/AddTransaction"
import { AddExpense } from "@/form/AddExpense"
import { AddIncome } from "@/form/AddIncome"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function Dashboard() {
  const { user, isLoading, userName } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get("date")
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      const parsed = moment(dateParam, "YYYY-MM-DD", true)
      if (parsed.isValid()) return parsed.toDate()
    }
    return new Date()
  })

  useEffect(() => {
    if (dateParam) {
      const parsed = moment(dateParam, "YYYY-MM-DD", true)
      if (parsed.isValid() && parsed.toDate().toDateString() !== selectedDate.toDateString()) {
        setSelectedDate(parsed.toDate())
      }
    }
  }, [dateParam])

  const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 1000 }, !!user?.id)

  const updateDateInUrl = (newDate: Date) => {
    const dateStr = moment(newDate).format("YYYY-MM-DD")
    router.push(`/dashboard?date=${dateStr}`)
  }

  const goToPreviousDate = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    updateDateInUrl(newDate)
  }

  const goToNextDate = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    if (newDate <= new Date()) updateDateInUrl(newDate)
  }

  const isToday = () => selectedDate.toDateString() === new Date().toDateString()

  const stats = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return { selectedSpent: 0, selectedCount: 0, weekSpent: 0, monthSpent: 0 }
    }
    const selDateMoment = moment(selectedDate).tz("Asia/Kolkata").startOf("day")
    const startOfWeek = moment(selDateMoment).subtract(6, "days").startOf("day")
    const startOfMonth = moment(selDateMoment).startOf("month")
    const endOfMonth = moment(selDateMoment).endOf("month")

    let selectedSpent = 0, selectedCount = 0, weekSpent = 0, monthSpent = 0

    transactions.forEach((t: any) => {
      const tDate = moment(t.occurred_at).tz("Asia/Kolkata")
      const amount = Number(t.amount) || 0
      const type = (t.type || "").toLowerCase()
      if (type === "expense") {
        if (tDate.isSame(selDateMoment, "day")) { selectedSpent += amount; selectedCount++ }
        if (tDate.isSameOrAfter(startOfWeek) && tDate.isSameOrBefore(selDateMoment.endOf("day"))) weekSpent += amount
        if (tDate.isSameOrAfter(startOfMonth) && tDate.isSameOrBefore(endOfMonth)) monthSpent += amount
      }
    })

    return { selectedSpent, selectedCount, weekSpent, monthSpent }
  }, [transactions, selectedDate])

  const transactionsForSelectedDate = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((t: any) =>
      moment(t.occurred_at).tz("Asia/Kolkata").isSame(moment(selectedDate), "day")
    )
  }, [transactions, selectedDate])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent" />
      </div>
    )
  }

  if (!user) return null

  const firstName = userName.split(" ")[0]

  return (
    <div className="max-w-md mx-auto min-h-screen bg-paper pt-6 pb-28">

      {/* Header */}
      <header className="px-5 pb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-ms-muted font-medium mb-0.5">{moment().format("dddd, MMM D")}</p>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Hey {firstName}</h1>
        </div>
        <Link 
          href="/settings"
          className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center shadow-sm active:scale-95 transition-all text-ms-muted hover:text-ink"
        >
          <Settings size={18} />
        </Link>
      </header>

      <div className="px-5 flex flex-col gap-5">

        {/* Date Navigator */}
        <div className="bg-surface border border-line rounded-2xl px-3 py-3.5 flex items-center justify-between shadow-sm">
          <button
            onClick={goToPreviousDate}
            className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-surface-alt transition-colors"
          >
            <ChevronLeft size={18} className="text-ink" />
          </button>

          <div className="text-center">
            <p className="font-bold text-sm text-ink">{moment(selectedDate).format("dddd, MMM D")}</p>
            <p className="text-[10px] text-ms-muted font-bold uppercase tracking-widest mt-0.5">
              {stats.selectedCount} Transaction{stats.selectedCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={goToNextDate}
            disabled={isToday()}
            className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-surface-alt transition-colors disabled:opacity-25"
          >
            <ChevronRight size={18} className="text-ink" />
          </button>
        </div>

        {/* Stats */}
        <DashboardStats
          selectedSpent={stats.selectedSpent}
          selectedCount={stats.selectedCount}
          selectedDate={selectedDate}
          weekSpent={stats.weekSpent}
          monthSpent={stats.monthSpent}
          isLoading={transactionsLoading}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <AddExpense
            trigger={
              <button className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 w-full active:bg-surface-alt transition-colors shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-neg/10 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-4 h-4 text-neg" />
                </div>
                <span className="text-sm font-semibold text-ink">Add Expense</span>
              </button>
            }
          />
          <AddIncome
            trigger={
              <button className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 w-full active:bg-surface-alt transition-colors shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-pos/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-pos" />
                </div>
                <span className="text-sm font-semibold text-ink">Add Income</span>
              </button>
            }
          />
        </div>

        {/* Transactions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-ink">Transactions</h2>
            <Link
              href="/transactions"
              className="text-[11px] font-semibold text-ms-muted flex items-center gap-0.5 active:opacity-70 transition-opacity"
            >
              View all <ChevRight size={13} />
            </Link>
          </div>

          <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
            {transactionsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-11 h-11 rounded-2xl bg-surface-alt shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-1/2 bg-surface-alt" />
                      <div className="h-3 rounded w-1/3 bg-surface-alt" />
                    </div>
                    <div className="h-4 w-16 rounded bg-surface-alt" />
                  </div>
                ))}
              </div>
            ) : transactionsForSelectedDate.length > 0 ? (
              <div>
                {transactionsForSelectedDate.map((t: any, idx: number) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-surface-alt ${
                      idx < transactionsForSelectedDate.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-surface-alt"
                    >
                      {t.categories?.icon || "💰"}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink leading-tight truncate">{t.title}</p>
                      <p className="text-[11px] text-ms-muted font-medium mt-0.5">
                        {t.categories?.name || "Uncategorized"}
                        {t.accounts?.name ? ` · ${t.accounts.name}` : ""}
                      </p>
                    </div>

                    {/* Amount + time */}
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${t.type?.toLowerCase() === "expense" ? "text-neg" : "text-pos"}`}>
                        {t.type?.toLowerCase() === "expense" ? "- " : "+ "}₹{Number(t.amount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-ms-muted font-medium mt-0.5">
                        {moment(t.occurred_at).tz("Asia/Kolkata").format("h:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📭</span>
                </div>
                <p className="text-sm font-medium text-ink">No transactions for this day</p>
                <p className="text-xs text-ms-muted mt-1">Tap Add Expense or Add Income to log one</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
