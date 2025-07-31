"use client"

import { useState, useRef } from "react"
import { Calendar, Trash2, Edit, TrendingDown, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
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
import {
  useUpdateTransaction,
  useDeleteTransaction,
  useCategories,
  useAccounts,
} from "@/lib/hooks"
import { TablesUpdate } from "@/types/supabase"

type TransactionUpdate = TablesUpdate<"transactions">

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

interface EditTransactionModalProps {
  transaction: Transaction
  children: React.ReactNode
}

export function EditTransactionModal({ transaction, children }: EditTransactionModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [activeTab, setActiveTab] = useState<"expense" | "income">(transaction.type)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    title: transaction.title,
    amount: transaction.amount.toString(),
    type: transaction.type,
    category_id: transaction.category_id,
    account_id: transaction.account_id,
    transaction_date: transaction.transaction_date,
    description: transaction.description || "",
  })

  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  // Get categories and accounts for dropdowns
  const { data: categories = [] } = useCategories(user?.id || "", { enabled: !!user?.id })
  const { data: accounts = [] } = useAccounts(user?.id || "", { enabled: !!user?.id })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "expense" | "income")
    setFormData((prev) => ({
      ...prev,
      type: value as "expense" | "income",
    }))
  }

  const handleUpdate = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      const transactionData: TransactionUpdate = {
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        type: formData.type as "expense" | "income",
        category_id: formData.category_id,
        account_id: formData.account_id,
        transaction_date: formData.transaction_date,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      }

      await updateTransaction.mutateAsync({ id: transaction.id, data: transactionData })

      // Reset form and close modal
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id,
        account_id: transaction.account_id,
        transaction_date: transaction.transaction_date,
        description: transaction.description || "",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  }

  const handleDelete = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      await deleteTransaction.mutateAsync(transaction.id)
      setIsOpen(false)
      setIsDeleteMode(false)
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
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
    setFormData((prev) => ({
      ...prev,
      transaction_date: formatDate(date),
    }))
    setShowDatePicker(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full mx-4 p-0 bg-white rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Edit Transaction</DialogTitle>

        {isDeleteMode ? (
          // Delete Confirmation
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Transaction</h2>
              <p className="text-gray-600">
                Are you sure you want to delete "{transaction.title}"? This action cannot be
                undone.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={deleteTransaction.isPending}
                className="w-full bg-red-500 text-white rounded-lg py-3 font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteTransaction.isPending ? "Deleting..." : "Delete Transaction"}
              </button>
              <button
                onClick={() => setIsDeleteMode(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Edit Form
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-600">Edit Transaction</h1>
              <button
                onClick={() => setIsDeleteMode(true)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction Type Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
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

            {/* Transaction Title */}
            <div className="space-y-2 mb-4">
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
            <div className="space-y-2 mb-4">
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
            <div className="space-y-2 mb-4">
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
            <div className="space-y-2 mb-4">
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
            <div className="space-y-2 mb-4">
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
            <div className="space-y-2 mb-6">
              <Label className="text-gray-800 font-medium">Description (Optional)</Label>
              <Input
                type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Transaction Preview */}
            <div className="mb-6">
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUpdate}
                disabled={updateTransaction.isPending}
                className="w-full bg-purple-500 text-white rounded-lg py-3 font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {updateTransaction.isPending ? "Updating..." : "Update Transaction"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
