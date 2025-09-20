import { useState, useCallback } from "react"
import { useUpdateTransactionMutation } from "@/hooks/useTransactions"

export interface EditTransactionFormData {
  title: string
  type: "expense" | "income"
  occurred_at: Date | undefined
  amount: string
  description: string
  category_id: string
  account_id: string
}

const defaultFormData: EditTransactionFormData = {
  title: "",
  type: "expense",
  occurred_at: new Date(),
  amount: "",
  description: "",
  category_id: "",
  account_id: "",
}

export const useEditTransactionDrawer = () => {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState<EditTransactionFormData>(defaultFormData)

  const updateTransaction = useUpdateTransactionMutation()

  const handleSubmit = useCallback(
    async (transactionId: string) => {
      if (!transactionId) return

      const transactionData = {
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        type: formData.type,
        category_id: formData.category_id,
        account_id: formData.account_id,
        occurred_at: formData.occurred_at
          ? formData.occurred_at.toISOString()
          : new Date().toISOString(),
        description: formData.description || "",
        updated_at: new Date().toISOString(),
      }

      await updateTransaction.mutateAsync({ id: transactionId, data: transactionData })
    },
    [formData, updateTransaction]
  )

  const isSubmitDisabled =
    !formData.title.trim() ||
    !formData.amount.trim() ||
    !formData.category_id ||
    !formData.account_id

  return {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: updateTransaction.isPending,
  }
}
