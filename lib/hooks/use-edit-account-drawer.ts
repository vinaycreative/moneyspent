import { useState } from "react"
import type { EditAccountFormData } from "@/form/EditAccount"

const defaultFormData: EditAccountFormData = {
  name: "",
  type: "bank",
  balance: "0",
  currency: "INR",
  account_number: "",
}

export const useEditAccountDrawer = (initialData?: Partial<EditAccountFormData>) => {
  const [formData, setFormData] = useState<EditAccountFormData>({
    ...defaultFormData,
    ...initialData,
  })

  return {
    formData,
    setFormData,
    isLoading: false, // This will be handled by the mutation in the component
  }
}