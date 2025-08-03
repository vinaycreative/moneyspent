import { useState } from "react"
import { useUpdateTransaction } from "./use-transactions"
import { TablesUpdate } from "@/types/supabase"

type TransactionUpdate = TablesUpdate<"transactions">

interface Transaction {
  id: string
  title: string
  amount: number
  type: "expense" | "income"
  category_id: string
  account_id: string
  transaction_date: string
  description?: string
  categories?: {
    name: string
    icon?: string
  }
  accounts?: {
    name: string
  }
}

export function useEditTransactionDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState({
    title: "",
    amount: "0",
    type: "expense" as "expense" | "income",
    category_id: "",
    account_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const updateTransaction = useUpdateTransaction()

  const openDrawer = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setActiveTab(transaction.type)
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category_id: transaction.category_id,
      account_id: transaction.account_id,
      transaction_date: transaction.transaction_date,
      description: transaction.description || "",
    })
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setSelectedTransaction(null)
    setActiveTab("expense")
    setFormData({
      title: "",
      amount: "0",
      type: "expense",
      category_id: "",
      account_id: "",
      transaction_date: new Date().toISOString().split("T")[0],
      description: "",
    })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "expense" | "income")
    setFormData((prev) => ({
      ...prev,
      type: value as "expense" | "income",
    }))
  }

  const handleSubmit = async () => {
    if (!selectedTransaction) return

    try {
      const transactionData: TransactionUpdate = {
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        type: formData.type,
        category_id: formData.category_id,
        account_id: formData.account_id,
        transaction_date: formData.transaction_date,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      }

      await updateTransaction.mutateAsync({ id: selectedTransaction.id, data: transactionData })
      closeDrawer()
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  }

  const isSubmitDisabled = !formData.title.trim() || !formData.amount.trim() || !formData.category_id || !formData.account_id || updateTransaction.isPending

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    selectedTransaction,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleTabChange,
    handleSubmit,
    isSubmitDisabled,
    isLoading: updateTransaction.isPending,
  }
} 