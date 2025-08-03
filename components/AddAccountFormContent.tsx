"use client"

import { useState } from "react"
import { Plus, Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
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
import { useCreateAccount } from "@/lib/hooks"
import { TablesInsert } from "@/types/supabase"

type AccountInsert = TablesInsert<"accounts">

export interface AccountFormData {
  name: string
  type: string
  balance: string
  currency: string
}

interface AddAccountFormContentProps {
  formData: AccountFormData
  onFormDataChange: (data: AccountFormData) => void
  onSubmit: () => void
  isLoading?: boolean
}

export function AddAccountFormContent({
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
}: AddAccountFormContentProps) {
  const { user } = useAuth()
  const createAccount = useCreateAccount()

  const accountTypes = [
    { value: "bank", label: "Bank Account", icon: Building2, color: "bg-blue-500" },
    { value: "credit_card", label: "Credit Card", icon: CreditCard, color: "bg-purple-500" },
    { value: "cash", label: "Cash", icon: Wallet, color: "bg-green-500" },
    { value: "savings", label: "Savings", icon: PiggyBank, color: "bg-orange-500" },
  ]

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
  ]

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)
  const selectedCurrency = currencies.find((currency) => currency.value === formData.currency)

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Account Name */}
        <div>
          <Label className="text-gray-800 font-medium">Account Name</Label>
          <Input
            type="text"
            placeholder="Enter account name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full border-gray-300 bg-white mt-1"
          />
        </div>

        {/* Account Type */}
        <div>
          <Label className="text-gray-800 font-medium">Account Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white mt-1">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map((type) => {
                const Icon = type.icon
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${type.color} text-white text-xs`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Initial Balance */}
        <div>
          <Label className="text-gray-800 font-medium">Initial Balance</Label>
          <Input
            type="number"
            placeholder="Enter initial balance"
            value={formData.balance}
            onChange={(e) => handleInputChange("balance", e.target.value)}
            className="w-full border-gray-300 bg-white mt-1"
          />
        </div>

        {/* Currency */}
        <div>
          <Label className="text-gray-800 font-medium">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange("currency", value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white mt-1">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        {selectedType && (
          <div className="bg-gray-50 rounded-lg p-3">
            <Label className="text-gray-700 mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType.color} text-white`}
              >
                <selectedType.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{formData.name || "Account Name"}</div>
                <div className="text-xs text-gray-500">{selectedType.label}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
