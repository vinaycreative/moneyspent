"use client"

import { Calendar, TrendingDown } from "lucide-react"

interface DashboardStatsProps {
  selectedSpent: number
  selectedCount: number
  selectedDate: Date
  weekSpent: number
  monthSpent: number
  isLoading: boolean
}

export function DashboardStats({
  selectedSpent,
  selectedCount,
  selectedDate,
  weekSpent,
  monthSpent,
  isLoading,
}: DashboardStatsProps) {
  const isToday = new Date().toDateString() === selectedDate.toDateString()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-32 bg-surface-alt rounded-2xl w-full" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-surface-alt rounded-2xl" />
          <div className="h-24 bg-surface-alt rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Selected Day Spend Card */}
      <div className="bg-surface border border-line rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold tracking-widest text-ms-muted uppercase">
            Spent {isToday ? "Today" : "on this day"}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-alt border border-line">
            <Calendar className="w-3 h-3 text-ms-muted" />
            <span className="text-[10px] font-medium text-ms-muted">
              {isToday ? "Today" : selectedDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <h1 className="text-5xl font-bold text-ink">₹{selectedSpent.toLocaleString()}</h1>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-ms-muted font-medium">
            {selectedCount} transaction{selectedCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid for Week and Month */}
      {/* <div className="grid grid-cols-2 gap-3">
        
        <div className="bg-surface border border-line rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-widest text-ms-muted uppercase block mb-3">
              This Week
            </span>
            <div className="text-xl font-bold text-ink">
              ₹{weekSpent.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] font-medium text-ms-muted mt-3">
            Last 7 days
          </div>
        </div>

        
        <div className="bg-surface border border-line rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-widest text-ms-muted uppercase block mb-3">
              This Month
            </span>
            <div className="text-xl font-bold text-ink">
              ₹{monthSpent.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] font-medium text-ms-muted mt-3">
            Current month
          </div>
        </div>
      </div> */}
    </div>
  )
}
