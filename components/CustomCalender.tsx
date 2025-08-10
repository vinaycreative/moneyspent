"use client"

import { format, setDate } from "date-fns"
import { CalendarIcon } from "lucide-react"


import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"



interface CustomCalenderProps {
  selected?: Date | undefined
  onSelect?: (date: Date | undefined) => void
  disabled?: boolean
}

export function CustomCalender({ selected, onSelect, disabled = false }: CustomCalenderProps) {
    const [date, setDate] = useState<Date | undefined>(selected || new Date())


  return (
    <Popover>
                <PopoverTrigger asChild>
                  
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        
                      )}
                      disabled={disabled}
                    >
                      {date ? format(date, "PPP") : "Select Date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      onSelect?.(newDate)
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
  )
}
