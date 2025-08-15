"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface DateTimePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "MM/DD/YYYY hh:mm",
  className,
  disabled = false,
  required = false,
  name,
  id,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isAM, setIsAM] = React.useState(true)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1).reverse()
  const minutes = Array.from({ length: 60 }, (_, i) => i + 1)

  // Set default AM/PM based on current time or existing date
  React.useEffect(() => {
    if (date) {
      setIsAM(date.getHours() < 12)
    } else {
      // Default to current time's AM/PM
      const now = new Date()
      setIsAM(now.getHours() < 12)
    }
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (date) {
        // Preserve the time from the existing date
        newDate.setHours(date.getHours())
        newDate.setMinutes(date.getMinutes())
      } else {
        // Set default time to current time if no date exists
        const now = new Date()
        newDate.setHours(now.getHours())
        newDate.setMinutes(now.getMinutes())
      }
      onDateChange?.(newDate)
    }
  }

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (date) {
      const newDate = new Date(date)
      if (type === "hour") {
        const hour = parseInt(value)
        // Convert 12-hour to 24-hour format
        const hour24 = isAM ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12
        newDate.setHours(hour24)
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value))
      }
      onDateChange?.(newDate)
    }
  }

  const handleAMPMChange = (isAMSelected: boolean) => {
    setIsAM(isAMSelected)
    if (date) {
      const newDate = new Date(date)
      const currentHour = newDate.getHours()
      let newHour = currentHour

      if (isAMSelected && currentHour >= 12) {
        // Converting PM to AM
        newHour = currentHour === 12 ? 0 : currentHour - 12
      } else if (!isAMSelected && currentHour < 12) {
        // Converting AM to PM
        newHour = currentHour === 0 ? 12 : currentHour + 12
      }

      newDate.setHours(newHour)
      onDateChange?.(newDate)
    }
  }

  // Prevent scroll events from bubbling up to parent scrollable containers
  const handleScroll = (e: React.UIEvent) => {
    e.stopPropagation()
  }

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Hidden input for form validation */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={date ? date.toISOString() : ""}
        required={required}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-start text-left text-sm bg-white border border-gray-300 rounded-sm py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-black",
          !date && "text-muted-foreground",
          required && !date && "border-red-300 focus:ring-red-500",
          className
        )}
        aria-required={required}
        aria-invalid={required && !date}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "MM/dd/yyyy HH:mm") : <span>{placeholder}</span>}
      </button>

      {/* Custom Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center rounded-t-[10px]"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute bg-white/50 inset-0" />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full mx-4 border">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h3 className="text-base font-semibold mb-3">Select Date and Time</h3>

            {/* Date and Time Picker */}
            <div className="flex min-h-[320px] overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                className="p-2 border border-r-0"
                onSelect={handleDateSelect}
              />
              <div className="flex flex-col border">
                <div className="grid grid-cols-2 border-b">
                  <Button
                    type="button"
                    size="icon"
                    className="w-full shrink-0 aspect-square text-xs rounded-none"
                    variant={isAM ? "default" : "ghost"}
                    onClick={() => handleAMPMChange(true)}
                  >
                    AM
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    className="w-full shrink-0 aspect-square text-xs rounded-none"
                    variant={isAM ? "ghost" : "default"}
                    onClick={() => handleAMPMChange(false)}
                  >
                    PM
                  </Button>
                </div>
                <div className="grid grid-cols-2 h-[280px]">
                  <div
                    className="flex flex-col p-2 h-full overflow-y-auto border-r"
                    onScroll={handleScroll}
                  >
                    {hours.map((hour) => {
                      // Convert current date hour to 12-hour format for comparison
                      const currentHour12 = date ? date.getHours() % 12 || 12 : 0
                      const isSelected = date && currentHour12 === hour

                      return (
                        <Button
                          key={hour}
                          type="button"
                          size="icon"
                          variant={isSelected ? "default" : "ghost"}
                          className="w-full shrink-0 aspect-square text-xs"
                          onClick={() => handleTimeChange("hour", hour.toString())}
                        >
                          {hour.toString().padStart(2, "0")}
                        </Button>
                      )
                    })}
                  </div>
                  <div
                    className="flex flex-col p-2 h-full overflow-y-auto"
                    onScroll={handleScroll}
                  >
                    {minutes.map((minute) => (
                      <Button
                        key={minute}
                        type="button"
                        size="icon"
                        variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                        className="w-full shrink-0 aspect-square text-xs"
                        onClick={() => handleTimeChange("minute", minute.toString())}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
