import React from "react"
import CustomDrawer from "@/components/CustomDrawer"
import { Plus, Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
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
import { CustomInput } from "@/components/CustomInput"

export interface AccountFormData {
  name: string
  type: string
  starting_balance: string
  currency: string
}

export const AddAccount = ({ trigger }: { trigger: React.ReactNode }) => {
  const {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
  } = useAccountForm()

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

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
    { value: "JPY", label: "Japanese Yen (¥)" },
    { value: "CAD", label: "Canadian Dollar (C$)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "CHF", label: "Swiss Franc (CHF)" },
  ]

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
      // The drawer will be closed automatically by the hook after successful submission
    } catch (error) {
      console.error("Failed to create account:", error)
    }
  }

  const selectedType = accountTypes.find((type) => type.value === formData.type)

  return (
    <CustomDrawer
      trigger={trigger}
      title="Add Account"
      SubmitIcon={Plus}
      submitTitle="Add Account"
      submitDisabled={isSubmitDisabled}
      submitLoading={isLoading}
      onSubmit={handleFormSubmit}
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openDrawer()
        } else {
          closeDrawer()
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

        {/* Initial Balance */}
        <CustomInput
          id="balance"
          label="Initial Balance"
          name="starting_balance"
          type="number"
          placeholder="Enter initial balance"
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

        {/* Account Type Selection Cards */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-gray-800 font-medium inline-block mb-1.5">
            Quick Select Account Type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {accountTypes.map((type) => {
              const Icon = type.icon
              const isSelected = formData.type === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("type", type.value)}
                  className={cn(
                    "p-3 border-2 rounded-md transition-all duration-200 hover:scale-105",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                        type.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
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
