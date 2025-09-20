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
import { useEditAccountDrawer } from "@/lib/hooks/use-edit-account-drawer"
import { useUpdateAccount } from "@/lib/hooks/use-accounts"
import { useAuth } from "@/lib/contexts/auth-context"
import { CustomInput } from "@/components/CustomInput"
import { ApiAccount } from "@/types"

export interface EditAccountFormData {
  name: string
  type: string
  balance: string
  currency: string
  account_number: string
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
  const { formData, setFormData, isLoading } = useEditAccountDrawer()

  const updateAccount = useUpdateAccount()

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
        balance: account.current_balance?.toString() || "0",
        currency: account.currency,
        account_number: account.name,
      })
    }
  }, [account, setFormData])

  const handleFormSubmit = async () => {
    try {
      // Create the account update data (only send fields that can be updated)
      const accountData = {
        name: formData.name,
        current_balance: parseFloat(formData.balance) || 0,
        is_archived: false, // Keep account active
      }

      // Call the update mutation directly
      await updateAccount.mutateAsync({ id: account.id, data: accountData })

      // Close the drawer and call onClose
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
      submitDisabled={!formData.name.trim() || !formData.balance.trim() || updateAccount.isPending}
      submitLoading={updateAccount.isPending}
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
          id="balance"
          label="Balance"
          name="balance"
          type="number"
          placeholder="Enter balance"
          value={formData.balance}
          onChange={(e) => handleInputChange("balance", e.target.value)}
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

        {/* Account Number */}
        <CustomInput
          id="account_number"
          label="Account Number (Optional)"
          name="account_number"
          placeholder="Enter account number"
          value={formData.account_number}
          onChange={(e) => handleInputChange("account_number", e.target.value)}
          className="col-span-2"
        />

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
                  {formData.balance && (
                    <div className="text-sm font-medium text-gray-700">
                      {formData.currency} {parseFloat(formData.balance).toLocaleString()}
                    </div>
                  )}
                  {formData.account_number && (
                    <div className="text-sm text-gray-500">Account: {formData.account_number}</div>
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
