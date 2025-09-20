import { useState } from "react"
import { useCreateAccountMutation, useUpdateAccountMutation } from "@/hooks"
import type { CreateAccountRequest, UpdateAccountRequest } from "@/types"

interface AccountFormData {
  name: string
  type: string
  starting_balance: string
  currency: string
}

const defaultFormData: AccountFormData = {
  name: "",
  type: "",
  starting_balance: "0",
  currency: "INR",
}

export const useAccountForm = (initialData?: Partial<AccountFormData>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<AccountFormData>({
    ...defaultFormData,
    ...initialData,
  })

  const createAccountMutation = useCreateAccountMutation()
  const updateAccountMutation = useUpdateAccountMutation()

  const openDrawer = () => {
    setIsOpen(true)
    if (!initialData) {
      setFormData(defaultFormData) // Reset form when opening for create
    }
  }

  const closeDrawer = () => {
    setIsOpen(false)
    if (!initialData) {
      setFormData(defaultFormData) // Reset form when closing create form
    }
  }

  const handleSubmit = async (accountId?: string) => {
    if (isSubmitDisabled) return

    const accountData = {
      name: formData.name.trim(),
      type: formData.type as any, // Will be validated by Zod schema
      starting_balance: parseFloat(formData.starting_balance) || 0,
      currency: formData.currency,
    }

    try {
      if (accountId) {
        // Update existing account
        await updateAccountMutation.mutateAsync({
          id: accountId,
          data: accountData as UpdateAccountRequest,
        })
      } else {
        // Create new account
        await createAccountMutation.mutateAsync(accountData)
      }
      closeDrawer() // Close drawer on successful operation
    } catch (error) {
      console.error("Failed to save account:", error)
      throw error // Re-throw so components can handle it
    }
  }

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.type ||
    createAccountMutation.isPending ||
    updateAccountMutation.isPending

  const isLoading = createAccountMutation.isPending || updateAccountMutation.isPending
  const error = createAccountMutation.error || updateAccountMutation.error
  const isSuccess = createAccountMutation.isSuccess || updateAccountMutation.isSuccess

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
    error,
    isSuccess,
  }
}
