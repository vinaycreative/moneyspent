import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCreateTransaction } from "@/lib/hooks"
import { TablesInsert } from "@/types/supabase"
import { TransactionFormData } from "@/form/AddTransaction"

type TransactionInsert = TablesInsert<"transactions">

export function useAddTransactionDrawer() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("expense")
  const [formData, setFormData] = useState<TransactionFormData>({
    type: "expense",
    date: new Date(),
    amount: "",
    description: "",
    category: "",
    account: "",
  })

  const createTransaction = useCreateTransaction()

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Reset form data when closing
    setFormData({
      type: "expense",
      date: new Date(),
      amount: "",
      description: "",
      category: "",
      account: "",
    })
    setActiveTab("expense")
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("No user ID available")
      return
    }

    try {
      // Use the date from the form (which includes any time changes made by the user)
      const transactionDate = formData.date
        ? formData.date.toISOString()
        : new Date().toISOString()

      const transactionData: TransactionInsert = {
        user_id: user.id,
        title: formData.description || "Untitled Transaction",
        amount: parseFloat(formData.amount) || 0,
        type: activeTab as "expense" | "income",
        transaction_date: transactionDate,
        description: formData.description || null,
        category_id: formData.category || null,
        account_id: formData.account || null,
      }

      await createTransaction.mutateAsync(transactionData)
      closeDrawer()
    } catch (error) {
      console.error("Failed to create transaction:", error)
      throw error // Re-throw to let the component handle the error
    }
  }

  const isSubmitDisabled =
    !formData.amount ||
    !formData.date ||
    !formData.category ||
    !formData.account ||
    createTransaction.isPending

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
