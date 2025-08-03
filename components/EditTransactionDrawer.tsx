"use client"

import { useState, useRef } from "react"
import { Calendar, Edit, TrendingDown, TrendingUp } from "lucide-react"
import { ReusableDrawer } from "@/components/ReusableDrawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCategories, useAccounts } from "@/lib/hooks"

interface Transaction {
  id: string
  title: string
  amount: number
  type: "expense" | "income"
  category_id: string
  account_id: string
  transaction_date: string
  description?: string
  categories?: {
    name: string
    icon?: string
  }
  accounts?: {
    name: string
  }
}

interface EditTransactionDrawerProps {
  transaction: Transaction
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activeTab: "expense" | "income"
  onTabChange: (value: string) => void
  formData: {
    title: string
    amount: string
    type: "expense" | "income"
    category_id: string
    account_id: string
    transaction_date: string
    description: string
  }
  onFormDataChange: (data: any) => void
  onSubmit: () => void
  isLoading: boolean
  isSubmitDisabled: boolean
}

export function EditTransactionDrawer({
  transaction,
  children,
  isOpen,
  onOpenChange,
  activeTab,
  onTabChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  isSubmitDisabled,
}: EditTransactionDrawerProps) {
  const { user } = useAuth()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Get categories and accounts for dropdowns
  const { data: categories = [] } = useCategories(user?.id || "", { enabled: !!user?.id })
  const { data: accounts = [] } = useAccounts(user?.id || "", { enabled: !!user?.id })

  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  const selectedCategory = categories.find((cat: any) => cat.id === formData.category_id)
  const selectedAccount = accounts.find((acc: any) => acc.id === formData.account_id)

  // Date picker functionality
  const generateCalendarDays = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add previous month's days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i)
      days.unshift({ date: prevDate, isCurrentMonth: false })
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }

    // Add next month's days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelectedDate = (date: Date) => {
    return formatDate(date) === formData.transaction_date
  }

  const handleDateSelect = (date: Date) => {
    handleInputChange("transaction_date", formatDate(date))
    setShowDatePicker(false)
  }

  return (
    <>
      <div onClick={() => onOpenChange(true)}>{children}</div>
      
      <ReusableDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Edit Transaction"
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
        submitTitle={isLoading ? "Updating..." : "Update"}
        submitIcon={<Edit className="w-4 h-4" />}
        submitDisabled={isSubmitDisabled}
      >
        <div className="space-y-6 p-6">
          {/* Transaction Type Tabs */}
          <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="text-sm">
                <TrendingDown className="w-4 h-4 mr-2" />
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
          {/* Transaction Title */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Transaction Title</Label>
            <Input
              type="text"
              placeholder="Enter transaction title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full border-gray-300 bg-white"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="w-full border-gray-300 bg-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange("category_id", value)}
            >
              <SelectTrigger className="w-full border-gray-300 bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Account</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => handleInputChange("account_id", value)}
            >
              <SelectTrigger className="w-full border-gray-300 bg-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Date</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Select date"
                value={new Date(formData.transaction_date).toLocaleDateString()}
                onClick={() => setShowDatePicker(!showDatePicker)}
                readOnly
                className="w-full border-gray-300 bg-white cursor-pointer"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[999] p-3"
              >
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day.date)}
                      className={`p-2 text-center text-xs rounded hover:bg-gray-100 ${
                        !day.isCurrentMonth ? "text-gray-300" : "text-gray-700"
                      } ${isToday(day.date) ? "bg-blue-100 text-blue-600 font-medium" : ""} ${
                        isSelectedDate(day.date) ? "bg-purple-500 text-white font-medium" : ""
                      }`}
                    >
                      {day.date.getDate()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleDateSelect(new Date())}
                  className="w-full mt-2 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded"
                >
                  Today
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Description (Optional)</Label>
            <Input
              type="text"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full border-gray-300 bg-white"
            />
          </div>
          </div>

          {/* Transaction Preview */}
          <div>
            <Label className="text-gray-800 font-medium mb-3 block">Preview</Label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-black">
                    {formData.title || "Transaction Title"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedCategory?.name || "Category"} • {selectedAccount?.name || "Account"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(formData.transaction_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold text-lg ${
                      activeTab === "expense" ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {activeTab === "expense" ? "-" : "+"} ₹ {parseFloat(formData.amount) || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReusableDrawer>
    </>
  )
} 