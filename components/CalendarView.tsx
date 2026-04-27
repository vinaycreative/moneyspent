"use client"

import { useState, useMemo } from "react"
import moment from "moment-timezone"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    const days = []

    // Add empty slots for the beginning of the month (Sunday = 0)
    const startDay = startOfMonth.day()
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
    const totals: Record<string, { expense: number; income: number }> = {}
    transactions.forEach((t) => {
      const dateStr = moment(t.occurred_at).format("YYYY-MM-DD")
      if (!totals[dateStr]) totals[dateStr] = { expense: 0, income: 0 }
      if (t.type === "expense") totals[dateStr].expense += t.amount
      else totals[dateStr].income += t.amount
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
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-line">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <div 
            key={day} 
            className={`text-center text-[10px] font-bold py-3 ${
              i === 0 ? "text-neg" : "text-ms-muted"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="border-b border-r border-line h-16" />
          }

          const dateStr = day.format("YYYY-MM-DD")
          const totals = dailyTotals[dateStr]
          const hasTransactions = totals && (totals.expense > 0 || totals.income > 0)
          const isSelected = moment(selectedDate).isSame(day, "day")
          const isToday = moment().isSame(day, "day")
          const isSunday = day.day() === 0

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(day.toDate())}
              className={`h-16 flex flex-col items-center justify-start pt-2 transition-all relative border-b border-r border-line ${
                isSelected
                  ? "bg-surface-alt"
                  : "hover:bg-surface-alt/50"
              }`}
            >
              {/* Day Number */}
              <span className={`
                text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full leading-none
                ${isSelected ? "bg-ink text-paper" : isToday ? "text-ms-accent font-bold" : isSunday ? "text-neg" : "text-ink"}
              `}>
                {day.date()}
              </span>

              {/* Amount Below */}
              {hasTransactions && (
                <span className={`text-[9px] font-semibold mt-0.5 ${
                  isSelected ? "text-ink/70" : "text-ms-muted"
                }`}>
                  {totals.expense > 0 ? formatAmount(totals.expense) : formatAmount(totals.income)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
