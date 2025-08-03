"use client"

import { Edit, Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
import { ReusableDrawer } from "@/components/ReusableDrawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  account_number?: string
  is_active: boolean
}

interface EditAccountDrawerProps {
  account: Account
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    name: string
    type: string
    balance: string
    currency: string
    account_number: string
  }
  onFormDataChange: (data: any) => void
  onSubmit: () => void
  isLoading: boolean
  isSubmitDisabled: boolean
}

export function EditAccountDrawer({
  account,
  children,
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  isSubmitDisabled,
}: EditAccountDrawerProps) {
  const accountTypes = [
    { value: "bank", label: "Bank Account", icon: Building2, color: "bg-blue-500" },
    { value: "credit", label: "Credit Card", icon: CreditCard, color: "bg-purple-500" },
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
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)
  const selectedCurrency = currencies.find((currency) => currency.value === formData.currency)

  return (
    <>
      <div onClick={() => onOpenChange(true)}>{children}</div>
      
      <ReusableDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Edit Account"
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
        submitTitle={isLoading ? "Updating..." : "Update"}
        submitIcon={<Edit className="w-4 h-4" />}
        submitDisabled={isSubmitDisabled}
      >
        <div className="space-y-6 p-6">
          {/* Account Type Selection */}
          <div>
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

          <div className="grid grid-cols-2 gap-4">
          {/* Account Name */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          </div>

          {/* Account Preview */}
          <div>
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
        </div>
      </ReusableDrawer>
    </>
  )
} 