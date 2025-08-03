import { useState } from "react"
import { useUpdateAccount } from "./use-accounts"
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

export function useEditAccountDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    balance: "0",
    currency: "INR",
    account_number: "",
  })

  const updateAccount = useUpdateAccount()

  const openDrawer = (account: Account) => {
    setSelectedAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      account_number: account.account_number || "",
    })
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setSelectedAccount(null)
    setFormData({
      name: "",
      type: "bank",
      balance: "0",
      currency: "INR",
      account_number: "",
    })
  }

  const handleSubmit = async () => {
    if (!selectedAccount) return

    try {
      const accountData: AccountUpdate = {
        name: formData.name,
        type: formData.type as "bank" | "credit" | "cash" | "savings",
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        account_number: formData.account_number || null,
        updated_at: new Date().toISOString(),
      }

      await updateAccount.mutateAsync({ id: selectedAccount.id, data: accountData })
      closeDrawer()
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const isSubmitDisabled = !formData.name.trim() || !formData.balance.trim()

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    selectedAccount,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: updateAccount.isPending,
  }
} 