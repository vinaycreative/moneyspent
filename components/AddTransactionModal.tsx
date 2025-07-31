"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCreateTransaction, useCategories, useAccounts } from "@/lib/hooks"
import { TablesInsert } from "@/types/supabase"

type TransactionInsert = TablesInsert<"transactions">

interface AddTransactionModalProps {
  children: React.ReactNode
}

export function AddTransactionModal({ children }: AddTransactionModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("expense")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    description: "",
    category: "",
    account: "",
  })

  const datePickerRef = useRef<HTMLDivElement>(null)

  // Get categories and accounts
  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id && isOpen,
  })
  const { data: accounts, isLoading: accountsLoading } = useAccounts(user?.id || "", {
    enabled: !!user?.id && isOpen,
  })

  // Create transaction mutation
  const createTransaction = useCreateTransaction()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      const transactionData: TransactionInsert = {
        user_id: user.id,
        title: formData.description || "Untitled Transaction",
        amount: parseFloat(formData.amount) || 0,
        type: activeTab as "expense" | "income",
        transaction_date: formData.date || new Date().toISOString().split("T")[0],
        description: formData.description || null,
        category_id: formData.category || null,
        account_id: formData.account || null,
      }

      await createTransaction.mutateAsync(transactionData)

      // Reset form and close modal
      setFormData({
        date: "",
        amount: "",
        description: "",
        category: "",
        account: "",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to create transaction:", error)
    }
  }

  const handleDateSelect = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }))
    setShowDatePicker(false)
  }

  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDatePicker])

  // Filter categories by type
  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || []

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full mx-4 p-0 bg-white rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Add Transaction</DialogTitle>
        {/* Custom Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-600">Money Manager</h1>
          </div>

          <div className="text-center">
            <div className="text-gray-600 font-medium">Today</div>
            <div className="text-sm text-gray-500">Add Transaction</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="expense"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-500 text-gray-600 rounded-md"
              >
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-500 text-gray-600 rounded-md"
              >
                Income
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="mt-6">
              <TransactionForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                onDateSelect={handleDateSelect}
                formatDateForDisplay={formatDateForDisplay}
                getCurrentDate={getCurrentDate}
                transactionType="expense"
                categories={filteredCategories}
                accounts={accounts || []}
                isLoading={createTransaction.isPending}
                categoriesLoading={categoriesLoading}
                accountsLoading={accountsLoading}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-6">
              <TransactionForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                onDateSelect={handleDateSelect}
                formatDateForDisplay={formatDateForDisplay}
                getCurrentDate={getCurrentDate}
                transactionType="income"
                categories={filteredCategories}
                accounts={accounts || []}
                isLoading={createTransaction.isPending}
                categoriesLoading={categoriesLoading}
                accountsLoading={accountsLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TransactionFormProps {
  formData: {
    date: string
    amount: string
    description: string
    category: string
    account: string
  }
  onInputChange: (field: string, value: string) => void
  onSubmit: () => void
  showDatePicker: boolean
  setShowDatePicker: (show: boolean) => void
  onDateSelect: (date: string) => void
  formatDateForDisplay: (date: string) => string
  getCurrentDate: () => string
  transactionType: "expense" | "income"
  categories: any[]
  accounts: any[]
  isLoading: boolean
  categoriesLoading: boolean
  accountsLoading: boolean
}

function TransactionForm({
  formData,
  onInputChange,
  onSubmit,
  showDatePicker,
  setShowDatePicker,
  onDateSelect,
  formatDateForDisplay,
  getCurrentDate,
  transactionType,
  categories,
  accounts,
  isLoading,
  categoriesLoading,
  accountsLoading,
}: TransactionFormProps) {
  const datePickerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-4">
      {/* Date Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Date</Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Select date"
            value={formData.date ? formatDateForDisplay(formData.date) : ""}
            onClick={() => setShowDatePicker(!showDatePicker)}
            readOnly
            className="w-full border-gray-300 bg-white cursor-pointer"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

          {/* Date Picker */}
          {showDatePicker && (
            <div
              ref={datePickerRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[999] p-3"
            >
              <div className="grid grid-cols-7 gap-1 text-xs">
                <div className="text-center font-medium text-gray-500">Su</div>
                <div className="text-center font-medium text-gray-500">Mo</div>
                <div className="text-center font-medium text-gray-500">Tu</div>
                <div className="text-center font-medium text-gray-500">We</div>
                <div className="text-center font-medium text-gray-500">Th</div>
                <div className="text-center font-medium text-gray-500">Fr</div>
                <div className="text-center font-medium text-gray-500">Sa</div>

                {/* Generate calendar days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - 15 + i)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = formData.date === date.toISOString().split("T")[0]

                  return (
                    <button
                      key={i}
                      onClick={() => onDateSelect(date.toISOString().split("T")[0])}
                      className={`p-2 text-center rounded ${
                        isToday
                          ? "bg-orange-500 text-white"
                          : isSelected
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => onDateSelect(getCurrentDate())}
                  className="w-full text-center text-sm text-orange-500 hover:text-orange-600"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Amount</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(e) => onInputChange("amount", e.target.value)}
          className="w-full border-gray-300 bg-white"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Description</Label>
        <Input
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          className="w-full border-gray-300 bg-white"
        />
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onInputChange("category", value)}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="w-full border-gray-300 bg-white">
            <SelectValue
              placeholder={categoriesLoading ? "Loading categories..." : "Select category"}
            />
          </SelectTrigger>
          <SelectContent>
            {categoriesLoading ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-categories" disabled>
                No categories available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Account Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Account</Label>
        <Select
          value={formData.account}
          onValueChange={(value) => onInputChange("account", value)}
          disabled={accountsLoading}
        >
          <SelectTrigger className="w-full border-gray-300 bg-white">
            <SelectValue
              placeholder={accountsLoading ? "Loading accounts..." : "Select Account"}
            />
          </SelectTrigger>
          <SelectContent>
            {accountsLoading ? (
              <SelectItem value="loading" disabled>
                Loading accounts...
              </SelectItem>
            ) : accounts.length > 0 ? (
              accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-accounts" disabled>
                No accounts available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Add Button */}
      <button
        onClick={onSubmit}
        disabled={!formData.amount || isLoading}
        className="w-full bg-gray-800 text-white py-4 rounded-lg font-medium mt-6 hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "Adding..." : "Add"}
      </button>
    </div>
  )
}
