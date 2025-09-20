"use client"

import { useState, useRef, memo } from "react"
import moment from "moment-timezone"
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
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/hooks"
import { useCategories, useAccounts } from "@/hooks"

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
    transaction_date: Date | undefined
    description: string
  }
  onFormDataChange: (data: any) => void
  onSubmit: () => void
  isLoading: boolean
  isSubmitDisabled: boolean
}

export const EditTransactionDrawer = memo(function EditTransactionDrawer({
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

  // Get categories and accounts for dropdowns
  const { data: categories = [] } = useCategories(user?.id || "")
  const { accounts = [] } = useAccounts(user?.id || "")

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    handleInputChange("transaction_date", date)
  }

  const selectedCategory = categories.find((cat: any) => cat.id === formData.category_id)
  const selectedAccount = accounts.find((acc: any) => acc.id === formData.account_id)

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
              <DatePicker
                date={formData.transaction_date}
                onDateChange={handleDateChange}
                placeholder="Select date"
                disabled={isLoading}
              />
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
                    {formData.transaction_date
                      ? moment(formData.transaction_date).tz("Asia/Kolkata").format("lll")
                      : "No date selected"}
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
})
