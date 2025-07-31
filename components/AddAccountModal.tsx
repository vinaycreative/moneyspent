"use client"

import { useState } from "react"
import { Plus, Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
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

interface AddAccountModalProps {
  children: React.ReactNode
}

export function AddAccountModal({ children }: AddAccountModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "INR",
  })

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
      const accountData: AccountInsert = {
        user_id: user.id,
        name: formData.name,
        type: formData.type as "bank" | "credit_card" | "cash" | "savings",
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        is_active: true,
      }

      await createAccount.mutateAsync(accountData)

      // Reset form and close modal
      setFormData({
        name: "",
        type: "",
        balance: "",
        currency: "INR",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to create account:", error)
    }
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)
  const selectedCurrency = currencies.find((currency) => currency.value === formData.currency)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full mx-4 p-0 bg-white rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Add Account</DialogTitle>
        {/* Custom Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-600">Money Manager</h1>
          </div>

          <div className="text-center">
            <div className="text-gray-600 font-medium">Add New Account</div>
            <div className="text-sm text-gray-500">Track your financial accounts</div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
            {/* Account Name */}
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Account Name</Label>
              <Input
                type="text"
                placeholder="e.g., HDFC Bank, Cash Wallet"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Account Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className="w-full border-gray-300 bg-white">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center ${type.color} text-white`}
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
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Initial Balance</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => handleInputChange("balance", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger className="w-full border-gray-300 bg-white">
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

            {/* Account Preview */}
            {formData.name && formData.type && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Account Preview</div>
                <div className="flex items-center gap-3">
                  {selectedType && (
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType.color} text-white`}
                    >
                      <selectedType.icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-black">{formData.name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {formData.type.replace("_", " ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">
                      {selectedCurrency?.value}{" "}
                      {parseFloat(formData.balance || "0").toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.type || createAccount.isPending}
              className="w-full bg-gray-800 text-white py-4 rounded-lg font-medium mt-6 hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {createAccount.isPending ? "Adding..." : "Add Account"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
