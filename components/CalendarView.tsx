"use client"

import { useState, useMemo } from "react"
import moment from "moment-timezone"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Transaction {
  id: string
  amount: number
  type: string
  occurred_at: string
}

interface CalendarViewProps {
  transactions: Transaction[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function CalendarView({ transactions, selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(moment(selectedDate).startOf("month"))

  const daysInMonth = useMemo(() => {
    const startOfMonth = moment(currentMonth).startOf("month")
    const endOfMonth = moment(currentMonth).endOf("month")
    const days = []

    // Add empty slots for the beginning of the month
    const startDay = startOfMonth.day() // 0 (Sun) to 6 (Sat)
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= startOfMonth.daysInMonth(); i++) {
      days.push(moment(startOfMonth).date(i))
    }

    return days
  }, [currentMonth])

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    transactions.forEach((t) => {
      if (t.type === "expense") {
        const dateStr = moment(t.occurred_at).format("YYYY-MM-DD")
        totals[dateStr] = (totals[dateStr] || 0) + t.amount
      }
    })
    return totals
  }, [transactions])

  const nextMonth = () => setCurrentMonth(moment(currentMonth).add(1, "month"))
  const prevMonth = () => setCurrentMonth(moment(currentMonth).subtract(1, "month"))

  const formatAmount = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`
    return Math.round(amount).toString()
  }

  return (
    <div className="bg-surface border border-line rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-bold text-ink">
          {currentMonth.format("MMMM YYYY")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors"
          >
            <ChevronLeft size={20} className="text-ms-muted" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors"
          >
            <ChevronRight size={20} className="text-ms-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-ms-muted py-2">
            {day}
          </div>
        ))}

        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-14" />

          const dateStr = day.format("YYYY-MM-DD")
          const total = dailyTotals[dateStr] || 0
          const isSelected = moment(selectedDate).isSame(day, "day")
          const isToday = moment().isSame(day, "day")

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(day.toDate())}
              className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                isSelected 
                  ? "bg-ink text-paper ring-2 ring-ms-accent ring-offset-2 ring-offset-surface" 
                  : total > 0 
                    ? "bg-surface-alt border border-line" 
                    : "hover:bg-surface-alt/50"
              }`}
            >
              <span className={`text-xs font-bold ${isSelected ? "text-paper" : "text-ink"}`}>
                {day.date()}
              </span>
              {total > 0 && (
                <span className={`text-[8px] font-bold mt-0.5 ${
                  isSelected ? "text-paper/80" : total > 1000 ? "text-ms-warning" : "text-ms-muted"
                }`}>
                  {formatAmount(total)}
                </span>
              )}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-ms-accent" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
