"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
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
import { useCategories, useAccounts } from "@/lib/hooks"
import { CustomCalender } from "@/components/CustomCalender"

export interface TransactionFormData {
  date: Date | undefined
  amount: string
  description: string
  category: string
  account: string
}

interface AddTransactionFormContentProps {
  formData: TransactionFormData
  onFormDataChange: (data: TransactionFormData) => void
  activeTab: string
  onActiveTabChange: (tab: string) => void
  isLoading?: boolean
}

export function AddTransactionFormContent({
  formData,
  onFormDataChange,
  activeTab,
  onActiveTabChange,
  isLoading = false,
}: AddTransactionFormContentProps) {
  const { user } = useAuth()

  // Get categories and accounts
  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })
  const { data: accounts, isLoading: accountsLoading } = useAccounts(user?.id || "", {
    enabled: !!user?.id,
  })

  const handleInputChange = (field: keyof TransactionFormData, value: string | Date | undefined) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    handleInputChange("date", date)
  }

  // Filter categories by type
  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || []

  return (
    <div className="space-y-6 p-6">
      {/* Transaction Type Tabs */}
      <Tabs value={activeTab} onValueChange={onActiveTabChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className="text-sm">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="text-sm">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Date</Label>
          <CustomCalender 
            selected={formData.date}
            onSelect={handleDateChange}
            disabled={isLoading}
          />
        </div>

        {/* Amount Field */}
        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            className="w-full border-gray-300 bg-white"
            disabled={isLoading}
          />
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
            disabled={categoriesLoading || isLoading}
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
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) => (
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
            onValueChange={(value) => handleInputChange("account", value)}
            disabled={accountsLoading || isLoading}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white">
              <SelectValue
                placeholder={accountsLoading ? "Loading accounts..." : "Select account"}
              />
            </SelectTrigger>
            <SelectContent>
              {accountsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading accounts...
                </SelectItem>
              ) : accounts && accounts.length > 0 ? (
                accounts.map((account: any) => (
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
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Description (Optional)</Label>
        <Input
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="w-full border-gray-300 bg-white"
          disabled={isLoading}
        />
      </div>
    </div>
  )
} 