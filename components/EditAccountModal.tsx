"use client"

import { useState } from "react"
import { Plus, Building2, CreditCard, Wallet, PiggyBank, Edit, Trash2 } from "lucide-react"
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
import { useUpdateAccount, useDeleteAccount } from "@/lib/hooks"
import { TablesUpdate } from "@/types/supabase"

type AccountUpdate = TablesUpdate<"accounts">

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  account_number?: string
  is_active: boolean
}

interface EditAccountModalProps {
  account: Account
  children: React.ReactNode
}

export function EditAccountModal({ account, children }: EditAccountModalProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [formData, setFormData] = useState({
    name: account.name,
    type: account.type,
    balance: account.balance.toString(),
    currency: account.currency,
    account_number: account.account_number || "",
  })

  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

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

  const handleUpdate = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      const accountData: AccountUpdate = {
        name: formData.name,
        type: formData.type as "bank" | "credit_card" | "cash" | "savings",
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        account_number: formData.account_number || null,
        updated_at: new Date().toISOString(),
      }

      await updateAccount.mutateAsync({ id: account.id, data: accountData })

      // Reset form and close modal
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        account_number: account.account_number || "",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const handleDelete = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      await deleteAccount.mutateAsync(account.id)
      setIsOpen(false)
      setIsDeleteMode(false)
    } catch (error) {
      console.error("Failed to delete account:", error)
    }
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)
  const selectedCurrency = currencies.find((currency) => currency.value === formData.currency)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full mx-4 p-0 bg-white rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Edit Account</DialogTitle>

        {isDeleteMode ? (
          // Delete Confirmation
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600">
                Are you sure you want to delete &quot;{account.name}&quot;? This action cannot be undone.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={deleteAccount.isPending}
                className="w-full bg-red-500 text-white rounded-lg py-3 font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
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
              <h1 className="text-xl font-bold text-gray-600">Edit Account</h1>
              <button
                onClick={() => setIsDeleteMode(true)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Account Type Selection */}
            <div className="mb-6">
              <Label className="text-gray-800 font-medium mb-3 block">Account Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {accountTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.type === type.value

                  return (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.color} text-white`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Account Name */}
            <div className="space-y-2 mb-4">
              <Label className="text-gray-800 font-medium">Account Name</Label>
              <Input
                type="text"
                placeholder="Enter account name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2 mb-4">
              <Label className="text-gray-800 font-medium">Account Number (Optional)</Label>
              <Input
                type="text"
                placeholder="Enter account number"
                value={formData.account_number}
                onChange={(e) => handleInputChange("account_number", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Balance */}
            <div className="space-y-2 mb-4">
              <Label className="text-gray-800 font-medium">Current Balance</Label>
              <Input
                type="number"
                placeholder="Enter balance"
                value={formData.balance}
                onChange={(e) => handleInputChange("balance", e.target.value)}
                className="w-full border-gray-300 bg-white"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2 mb-6">
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
            <div className="mb-6">
              <Label className="text-gray-800 font-medium mb-3 block">Preview</Label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedType?.color || "bg-gray-500"
                    } text-white`}
                  >
                    {selectedType && <selectedType.icon className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">{formData.name || "Account Name"}</div>
                    {formData.account_number && (
                      <div className="text-sm text-gray-500">{formData.account_number}</div>
                    )}
                    <div className="text-xs text-gray-400 capitalize">
                      {formData.type.replace("_", " ")} • {selectedCurrency?.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {selectedCurrency?.value === "INR" ? "₹" : "$"}{" "}
                      {parseFloat(formData.balance) || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUpdate}
                disabled={updateAccount.isPending}
                className="w-full bg-purple-500 text-white rounded-lg py-3 font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {updateAccount.isPending ? "Updating..." : "Update Account"}
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
