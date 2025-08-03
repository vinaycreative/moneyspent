import { useState } from "react"
import { useCreateCategory, useUpdateCategory } from "./use-categories"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type CategoryInsert = TablesInsert<"categories">
type CategoryUpdate = TablesUpdate<"categories">

interface Category {
  id: string
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

export function useAddEditCategoryDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "expense" | "income",
    icon: "📁",
    color: "bg-gray-400",
  })

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const openDrawer = (category?: Category) => {
    if (category) {
      // Edit mode
      setSelectedCategory(category)
      setIsEditing(true)
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      })
    } else {
      // Add mode
      setSelectedCategory(null)
      setIsEditing(false)
      setFormData({
        name: "",
        type: "expense",
        icon: "📁",
        color: "bg-gray-400",
      })
    }
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setSelectedCategory(null)
    setIsEditing(false)
    setFormData({
      name: "",
      type: "expense",
      icon: "📁",
      color: "bg-gray-400",
    })
  }

  const handleSubmit = async () => {
    if (isEditing && selectedCategory) {
      // Update category
      try {
        const categoryData: CategoryUpdate = {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
          updated_at: new Date().toISOString(),
        }

        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          ...categoryData,
        })
        closeDrawer()
      } catch (error) {
        console.error("Failed to update category:", error)
      }
    } else {
      // Create category
      try {
        const categoryData: CategoryInsert = {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
        }

        await createCategory.mutateAsync(categoryData)
        closeDrawer()
      } catch (error) {
        console.error("Failed to create category:", error)
      }
    }
  }

  const isSubmitDisabled = !formData.name.trim() || (isEditing ? updateCategory.isPending : createCategory.isPending)

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    selectedCategory,
    isEditing,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading: isEditing ? updateCategory.isPending : createCategory.isPending,
  }
} 