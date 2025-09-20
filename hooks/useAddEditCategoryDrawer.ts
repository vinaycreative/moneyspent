import { useState, useCallback } from "react"
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/hooks/useCategories"
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/types"

export interface CategoryFormData {
  name: string
  kind: "expense" | "income" | "transfer"
  icon: string
  color: string
  is_default?: boolean
}

const defaultFormData: CategoryFormData = {
  name: "",
  kind: "expense",
  icon: "🏷️",
  color: "#6366f1",
  is_default: false,
}

export const useAddEditCategoryDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)

  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  const openDrawer = useCallback((category?: any) => {
    setIsOpen(true)
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name || "",
        kind: category.type || "expense", // Map frontend 'type' to API 'kind'
        icon: category.icon || "🏷️",
        color: category.color || "#6366f1",
        is_default: category.is_default || false,
      })
    } else {
      setEditingCategory(null)
      setFormData(defaultFormData)
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    setEditingCategory(null)
    setFormData(defaultFormData)
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          kind: formData.kind,
          icon: formData.icon,
          color: formData.color,
          is_default: formData.is_default,
        }
        await updateMutation.mutateAsync({ id: editingCategory.id, data: updateData })
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: formData.name,
          kind: formData.kind,
          icon: formData.icon,
          color: formData.color,
          is_default: formData.is_default || false,
        }
        await createMutation.mutateAsync(createData)
      }
      closeDrawer()
    } catch (error) {
      console.error("Failed to save category:", error)
      throw error
    }
  }, [editingCategory, formData, createMutation, updateMutation, closeDrawer])

  const isSubmitDisabled = !formData.name.trim() || !formData.icon.trim()
  const isLoading = createMutation.isPending || updateMutation.isPending

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
    editingCategory,
    isEditMode: !!editingCategory,
  }
}