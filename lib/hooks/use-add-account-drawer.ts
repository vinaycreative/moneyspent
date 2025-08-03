import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCreateAccount } from "@/lib/hooks"
import { TablesInsert } from "@/types/supabase"
import { AccountFormData } from "@/components/AddAccountFormContent"

type AccountInsert = TablesInsert<"accounts">

export function useAddAccountDrawer() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    type: "",
    balance: "",
    currency: "INR",
  })

  const createAccount = useCreateAccount()

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Reset form data when closing
    setFormData({
      name: "",
      type: "",
      balance: "",
      currency: "INR",
    })
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
      closeDrawer()
    } catch (error) {
      console.error("Failed to create account:", error)
    }
  }

  const isSubmitDisabled = !formData.name || !formData.type || createAccount.isPending

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: createAccount.isPending,
  }
}
