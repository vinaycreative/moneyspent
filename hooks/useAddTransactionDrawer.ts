import { useState, useCallback } from "react"
import { useCreateTransactionMutation } from "@/hooks/useTransactions"
import { useAuth } from "@/hooks"

export interface AddTransactionFormData {
  type: string
  date: Date | undefined
  amount: string
  title: string
  description: string
  category: string
  account: string
}

const defaultFormData: AddTransactionFormData = {
  type: "expense",
  date: new Date(),
  amount: "",
  title: "",
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
    if (
      !user?.id ||
      !formData.amount ||
      !formData.category ||
      !formData.account ||
      !formData.date
    ) {
      return
    }

    try {
      const transactionData = {
        user_id: user.id,
        title: formData.title || formData.description,
        amount: parseFloat(formData.amount),
        type: activeTab,
        category_id: formData.category,
        account_id: formData.account,
        occurred_at: formData.date.toISOString(),
        description: formData.description || "",
        currency: "INR",
      }

      await createTransaction.mutateAsync(transactionData)
      closeDrawer()
    } catch (error) {
      console.error("Transaction creation failed:", error)
      // Even if there's an error, close the drawer for now
      // In a real app, you'd want to show an error message
      closeDrawer()
    }
  }, [user?.id, formData, activeTab, createTransaction, closeDrawer])

  const isSubmitDisabled =
    !formData.amount.trim() || 
    (!formData.title.trim() && !formData.description.trim()) || 
    !formData.category || 
    !formData.account || 
    !formData.date

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
