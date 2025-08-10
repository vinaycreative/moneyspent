import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCreateTransaction } from "@/lib/hooks"
import { TablesInsert } from "@/types/supabase"
import { TransactionFormData } from "@/components/AddTransactionFormContent"

type TransactionInsert = TablesInsert<"transactions">

export function useAddTransactionDrawer() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("expense")
  const [formData, setFormData] = useState<TransactionFormData>({
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
      // Create a proper date with time for the transaction
      let transactionDate: string
      if (formData.date) {
        // If user selected a specific date, combine it with current time
        const selectedDate = new Date(formData.date)
        const now = new Date()
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
        transactionDate = selectedDate.toISOString()
      } else {
        // If no date selected, use current date and time
        transactionDate = new Date().toISOString()
      }

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
    }
  }

  const isSubmitDisabled = !formData.amount || createTransaction.isPending

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