"use client"

import React from "react"
import { DateTimePicker } from "./DateTimePicker"

export function DateTimePickerDemo() {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date>()

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">DateTimePicker Demo</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Date and Time:</label>
        <DateTimePicker
          date={selectedDateTime}
          onDateChange={setSelectedDateTime}
          placeholder="Choose date and time..."
        />
      </div>

      {selectedDateTime && (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">Selected:</p>
          <p className="font-medium">{selectedDateTime.toLocaleString()}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled State:</label>
        <DateTimePicker
          date={selectedDateTime}
          onDateChange={setSelectedDateTime}
          disabled={true}
        />
      </div>
    </div>
  )
}
