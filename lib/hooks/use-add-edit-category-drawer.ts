import { useState, useCallback } from "react"

export interface CategoryFormData {
  name: string
  type: "expense" | "income"
}

const defaultFormData: CategoryFormData = {
  name: "",
  type: "expense",
}

export const useAddEditCategoryDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)

  const openDrawer = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    // Reset form data when closing
    setFormData(defaultFormData)
  }, [])

  const handleSubmit = useCallback(async () => {
    // This will be handled by the component that uses this hook
    // The actual mutation should be called from the component
  }, [])

  const isSubmitDisabled = !formData.name.trim()

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: false, // This will be handled by the mutation in the component
  }
}