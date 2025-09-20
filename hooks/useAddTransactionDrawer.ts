import { useState, useCallback } from "react"
import { useCreateTransactionMutation } from "@/hooks/useTransactions"
import { useAuth } from "@/lib/contexts/auth-context"

export interface AddTransactionFormData {
  type: string
  date: Date | undefined
  amount: string
  description: string
  category: string
  account: string
}

const defaultFormData: AddTransactionFormData = {
  type: "expense",
  date: new Date(),
  amount: "",
  description: "",
  category: "",
  account: "",
}

export const useAddTransactionDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState<AddTransactionFormData>(defaultFormData)
  
  const { user } = useAuth()
  const createTransaction = useCreateTransactionMutation()

  const openDrawer = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    // Reset form data when closing
    setFormData(defaultFormData)
    setActiveTab("expense")
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!user?.id || !formData.amount || !formData.category || !formData.account || !formData.date) {
      return
    }

    const transactionData = {
      user_id: user.id,
      title: formData.description,
      amount: parseFloat(formData.amount),
      type: activeTab,
      category_id: formData.category,
      account_id: formData.account,
      transaction_date: formData.date.toISOString(),
      description: formData.description || null,
    }

    await createTransaction.mutateAsync(transactionData)
    closeDrawer()
  }, [user?.id, formData, activeTab, createTransaction, closeDrawer])

  const isSubmitDisabled = !formData.amount.trim() || !formData.category || !formData.account || !formData.date

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: createTransaction.isPending,
  }
}