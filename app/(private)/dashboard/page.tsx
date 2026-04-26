"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowLeft, ArrowRight, Plus, ChevronRight } from "lucide-react"
import { DashboardStats } from "@/components/DashboardStats"
import { useAuth } from "@/hooks"
import { useTransactions } from "@/hooks"
import moment from "moment-timezone"
import { AddTransaction } from "@/form/AddTransaction"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function Dashboard() {
  const { user, isLoading, userName } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get date from URL or default to today
  const dateParam = searchParams.get("date")
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      const parsed = moment(dateParam, "YYYY-MM-DD", true)
      if (parsed.isValid()) return parsed.toDate()
    }
    return new Date()
  })

  // Sync state with URL when date changes internally (though we prefer URL as source of truth)
  useEffect(() => {
    if (dateParam) {
      const parsed = moment(dateParam, "YYYY-MM-DD", true)
      if (parsed.isValid() && parsed.toDate().toDateString() !== selectedDate.toDateString()) {
        setSelectedDate(parsed.toDate())
      }
    }
  }, [dateParam])

  // Get user's transactions
  const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 1000 }, !!user?.id)

  // Navigate dates via URL
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
    if (newDate <= new Date()) {
      updateDateInUrl(newDate)
    }
  }

  const isToday = () => {
    return selectedDate.toDateString() === new Date().toDateString()
  }

  // Calculate totals based on the SELECTED date's context
  const stats = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return { selectedSpent: 0, selectedCount: 0, weekSpent: 0, monthSpent: 0 }
    }

    const selDateMoment = moment(selectedDate).tz("Asia/Kolkata").startOf('day')
    // Week: 7 days including the selected date
    const startOfWeek = moment(selDateMoment).subtract(6, 'days').startOf('day')
    // Month: Full month of the selected date
    const startOfMonth = moment(selDateMoment).startOf('month')
    const endOfMonth = moment(selDateMoment).endOf('month')

    let selectedSpent = 0
    let selectedCount = 0
    let weekSpent = 0
    let monthSpent = 0

    transactions.forEach((t: any) => {
      const tDate = moment(t.occurred_at).tz("Asia/Kolkata")
      const amount = Number(t.amount) || 0
      const type = (t.type || "").toLowerCase()
      
      if (type === 'expense') {
        // Selected Day
        if (tDate.isSame(selDateMoment, 'day')) {
          selectedSpent += amount
          selectedCount++
        }
        
        // Week context (7 days leading to selected date)
        if (tDate.isSameOrAfter(startOfWeek) && tDate.isSameOrBefore(selDateMoment.endOf('day'))) {
          weekSpent += amount
        }
        
        // Month context (Full month of selected date)
        if (tDate.isSameOrAfter(startOfMonth) && tDate.isSameOrBefore(endOfMonth)) {
          monthSpent += amount
        }
      }
    })

    return { selectedSpent, selectedCount, weekSpent, monthSpent }
  }, [transactions, selectedDate])

  // Filter transactions for selected date
  const transactionsForSelectedDate = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((t: any) => 
      moment(t.occurred_at).tz("Asia/Kolkata").isSame(moment(selectedDate), 'day')
    )
  }, [transactions, selectedDate])

  if (isLoading) {
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

  return (
    <div className="max-w-md mx-auto h-full flex flex-col mobile-viewport bg-paper">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <div className="text-ms-muted text-[10px] font-bold mb-1 uppercase tracking-[0.15em] opacity-80">
          {moment().format("dddd, MMM D")}
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-ink">Hey {userName.split(' ')[0]}</h1>
          <div className="w-10 h-10 rounded-full bg-surface-alt border border-line flex items-center justify-center overflow-hidden shadow-sm">
             {user.avatar ? (
               <img src={user.avatar} alt={userName} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-ms-accent/10 flex items-center justify-center text-ms-accent font-bold">
                 {userName.charAt(0)}
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Date Navigation */}
      <section className="px-4 mb-4">
        <div className="bg-surface border border-line rounded-2xl p-2 flex items-center justify-between shadow-sm">
          <button
            onClick={goToPreviousDate}
            className="p-2.5 rounded-xl transition-all active:scale-90 hover:bg-surface-alt bg-surface border border-line/50"
          >
            <ArrowLeft size={18} className="text-ink" />
          </button>

          <div className="text-center">
            <div className="font-bold text-ink text-sm">
              {moment(selectedDate).format("dddd, MMM D")}
            </div>
            <div className="text-[10px] text-ms-muted font-bold uppercase tracking-tight">
              {stats.selectedCount} transaction{stats.selectedCount !== 1 ? "s" : ""}
            </div>
          </div>

          <button
            onClick={goToNextDate}
            disabled={isToday()}
            className="p-2.5 rounded-xl transition-all active:scale-90 hover:bg-surface-alt bg-surface border border-line/50 disabled:opacity-20"
          >
            <ArrowRight size={18} className="text-ink" />
          </button>
        </div>
      </section>

      {/* Analytics Cards */}
      <section className="px-4 mb-8">
        <DashboardStats
          selectedSpent={stats.selectedSpent}
          selectedCount={stats.selectedCount}
          selectedDate={selectedDate}
          weekSpent={stats.weekSpent}
          monthSpent={stats.monthSpent}
          isLoading={transactionsLoading}
        />
      </section>

      {/* Transactions for Date */}
      <section className="px-4 pb-10 flex-1">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {isToday() ? "Recent" : "Transactions"}
            </h2>
          </div>
          <Link href="/transactions" className="flex items-center gap-1 text-xs font-bold text-ms-warning hover:opacity-80 transition-opacity">
            View all <ChevronRight size={14} strokeWidth={3} />
          </Link>
        </div>

        <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
          {transactionsLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-surface-alt" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-1/2 bg-surface-alt" />
                    <div className="h-3 rounded w-1/3 bg-surface-alt" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactionsForSelectedDate.length > 0 ? (
            <div className="divide-y divide-line/50">
              {transactionsForSelectedDate.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-alt/40 cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: `${transaction.categories?.color}20` || '#f3f4f6' }}
                  >
                    <span role="img" aria-label="icon">
                      {transaction.categories?.icon || "💰"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-[15px] text-ink leading-tight mb-0.5">{transaction.title}</div>
                    <div className="text-[11px] text-ms-muted font-medium flex items-center gap-1.5 opacity-80">
                      <span>{transaction.categories?.name || "Uncategorized"}</span>
                      <span className="w-1 h-1 rounded-full bg-line-strong" />
                      <span>{transaction.accounts?.name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-[15px] ${transaction.type?.toLowerCase() === "expense" ? "text-ink" : "text-pos"}`}>
                      {transaction.type?.toLowerCase() === "expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-ms-muted font-medium mt-0.5 opacity-70">
                      {moment(transaction.occurred_at).tz("Asia/Kolkata").format("h:mm A")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6">
               <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
                 <Plus className="text-ms-muted w-8 h-8 opacity-20" />
               </div>
               <p className="text-ms-muted text-sm font-medium">No transactions for this day</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-6 z-10">
        <AddTransaction
          trigger={
            <button className="w-14 h-14 rounded-2xl bg-ms-warning text-white shadow-lg shadow-ms-warning/30 flex items-center justify-center transition-all active:scale-90 hover:scale-105 active:shadow-none">
              <Plus size={30} strokeWidth={2.5} />
            </button>
          }
        />
      </div>
    </div>
  )
}
