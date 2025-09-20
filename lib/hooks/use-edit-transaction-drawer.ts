import { useState, useCallback } from "react"

export interface EditTransactionFormData {
  title: string
  type: "expense" | "income"
  transaction_date: Date | undefined
  amount: string
  description: string
  category_id: string
  account_id: string
}

const defaultFormData: EditTransactionFormData = {
  title: "",
  type: "expense",
  transaction_date: new Date(),
  amount: "",
  description: "",
  category_id: "",
  account_id: "",
}

export const useEditTransactionDrawer = () => {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState<EditTransactionFormData>(defaultFormData)

  const handleSubmit = useCallback(async () => {
    // This will be handled by the component that uses this hook
    // The actual mutation should be called from the component
  }, [])

  const isSubmitDisabled = !formData.title.trim() || !formData.amount.trim() || !formData.category_id || !formData.account_id

  return {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: false, // This will be handled by the mutation in the component
  }
}