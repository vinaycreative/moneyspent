import React from "react"
import CustomDrawer from "@/components/CustomDrawer"
import { Edit, Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccountForm } from "@/hooks"
import { useAuth } from "@/hooks"
import { CustomInput } from "@/components/CustomInput"
import { ApiAccount } from "@/types"

export interface EditAccountFormData {
  name: string
  type: string
  starting_balance: string
  currency: string
}

export const EditAccount = ({
  trigger,
  account,
  onClose,
  isOpen,
  onOpenChange,
}: {
  trigger: React.ReactNode
  account: ApiAccount
  onClose?: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { user } = useAuth()
  const { formData, setFormData, isLoading, handleSubmit } = useAccountForm({
    name: account.name,
    type: account.type,
    starting_balance: account.current_balance?.toString() || "0",
    currency: account.currency || "INR",
  })

  const handleInputChange = (field: keyof EditAccountFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const accountTypes = [
    { value: "bank", label: "Bank Account", icon: Building2, color: "bg-blue-500" },
    { value: "credit", label: "Credit Card", icon: CreditCard, color: "bg-purple-500" },
    { value: "cash", label: "Cash", icon: Wallet, color: "bg-green-500" },
    { value: "wallet", label: "Wallet", icon: Wallet, color: "bg-green-600" },
    { value: "savings", label: "Savings", icon: PiggyBank, color: "bg-orange-500" },
    { value: "investment", label: "Investment", icon: PiggyBank, color: "bg-indigo-500" },
  ]

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "JPY", label: "Japanese Yen (¥)" },
    { value: "CAD", label: "Canadian Dollar (C$)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "CHF", label: "Swiss Franc (CHF)" },
  ]

  // Initialize form data when account changes
  React.useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        starting_balance: account.current_balance?.toString() || "0",
        currency: account.currency || "INR",
      })
    }
  }, [account, setFormData])

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(account.id)
      onClose?.()
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)

  return (
    <CustomDrawer
      trigger={trigger}
      title="Edit Account"
      SubmitIcon={Edit}
      submitTitle="Update Account"
      submitDisabled={!formData.name.trim() || !formData.starting_balance.trim() || isLoading}
      submitLoading={isLoading}
      onSubmit={handleFormSubmit}
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          onClose?.()
        }
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Account Name */}
        <CustomInput
          id="name"
          label="Account Name"
          name="name"
          placeholder="Enter account name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />

        {/* Account Type */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-gray-800 font-medium">Account Type</Label>
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
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs",
                          type.color
                        )}
                      >
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Balance */}
        <CustomInput
          id="starting_balance"
          label="Balance"
          name="starting_balance"
          type="number"
          placeholder="Enter balance"
          value={formData.starting_balance}
          onChange={(e) => handleInputChange("starting_balance", e.target.value)}
          inputMode="numeric"
          required
        />

        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-gray-800 font-medium">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange("currency", value)}
          >
            <SelectTrigger className="w-full border-gray-300 bg-white py-3">
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
          <div className="space-y-2 col-span-2">
            <Label className="text-gray-800 font-medium">Preview</Label>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                    selectedType.color
                  )}
                >
                  <selectedType.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formData.name || "Account Name"}
                  </div>
                  <div className="text-sm text-gray-500">{selectedType.label}</div>
                  {formData.starting_balance && (
                    <div className="text-sm font-medium text-gray-700">
                      {formData.currency} {parseFloat(formData.starting_balance).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomDrawer>
  )
}
