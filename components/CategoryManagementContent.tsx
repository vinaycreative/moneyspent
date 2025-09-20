"use client"

import { useState } from "react"
import { Edit2, Trash2, Tag, Plus, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks"
import {
  useCategories,
} from "@/hooks"
import { DeleteConfirmationSheet } from "./DeleteConfirmationSheet"

interface CategoryForm {
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

interface CategoryManagementContentProps {
  onClose: () => void
}

export function CategoryManagementContent({ onClose }: CategoryManagementContentProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    type: "expense",
    icon: "💰",
    color: "bg-gray-500",
  })

  // Get categories from API
  const { data: categories, isLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })

  // Mutations
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const iconOptions = [
    "🍔",
    "🍽️",
    "☕",
    "🍕",
    "🍦",
    "🍎",
    "🥗",
    "🍜",
    "🍣",
    "🍖",
    "⛽",
    "🚗",
    "🚌",
    "🚇",
    "🚲",
    "✈️",
    "🚢",
    "🚅",
    "🛵",
    "🚁",
    "🛒",
    "🛍️",
    "👕",
    "👖",
    "👟",
    "👜",
    "💄",
    "🧴",
    "📱",
    "💻",
    "🎬",
    "🎮",
    "🎵",
    "🎨",
    "📚",
    "🎭",
    "🎪",
    "🎯",
    "🎲",
    "🎸",
    "💰",
    "📈",
    "💵",
    "💳",
    "🏦",
    "📊",
    "💎",
    "🏆",
    "🎁",
    "💼",
    "🏥",
    "💊",
    "🩺",
    "🦷",
    "👨‍⚕️",
    "🩹",
    "🩻",
    "🧬",
    "🔬",
    "🎓",
    "📝",
    "✏️",
    "📖",
    "🎒",
    "🏫",
    "👨‍🏫",
    "📋",
    "📊",
    "🏠",
    "🏢",
    "🏪",
    "🏨",
    "🏰",
    "⛪",
    "🕌",
    "🕍",
    "🛕",
    "⛩️",
    "🗽",
    "🗼",
    "🎡",
    "🎢",
    "🎠",
    "⛲",
    "⛱️",
    "🏖️",
    "🏝️",
    "🏔️",
    "⛰️",
    "🌋",
    "🗻",
    "🏕️",
    "⛺",
    "🏜️",
    "🏞️",
    "🏟️",
    "🏛️",
    "🏗️",
    "🧱",
    "🏘️",
    "🏚️",
    "🏡",
    "🏠",
    "🏗️",
    "🏭",
    "🏢",
    "🏬",
    "🏣",
    "🏤",
    "🏥",
    "🏨",
    "🏪",
    "🏫",
    "🏩",
    "💒",
    "⛪",
    "🕌",
    "🕍",
    "🛕",
    "⛩️",
    "🗽",
    "🗼",
    "🏰",
    "🏯",
    "🏟️",
    "🎡",
    "🎢",
    "🎠",
    "⛲",
    "⛱️",
    "🏖️",
    "🏝️",
    "🏔️",
    "⛰️",
    "🌋",
    "🗻",
    "🏕️",
    "⛺",
    "🏜️",
    "🏞️",
  ]

  const colorOptions = [
    { name: "Gray", value: "bg-gray-400" },
    { name: "Red", value: "bg-red-400" },
    { name: "Orange", value: "bg-orange-400" },
    { name: "Yellow", value: "bg-yellow-400" },
    { name: "Green", value: "bg-green-400" },
    { name: "Blue", value: "bg-blue-400" },
    { name: "Purple", value: "bg-purple-400" },
    { name: "Pink", value: "bg-pink-400" },
    { name: "Indigo", value: "bg-indigo-400" },
    { name: "Teal", value: "bg-teal-400" },
    { name: "Cyan", value: "bg-cyan-400" },
    { name: "Lime", value: "bg-lime-400" },
    { name: "Emerald", value: "bg-emerald-400" },
    { name: "Rose", value: "bg-rose-400" },
    { name: "Violet", value: "bg-violet-400" },
  ]

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      icon: "📁",
      color: "bg-gray-400",
    })
    setIsEditing(false)
    setEditingCategory(null)
  }

  const handleCreateCategory = async () => {
    if (!formData.name.trim() || !user?.id) return

    try {
      await createCategory.mutateAsync({
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
        user_id: user.id,
      })
      resetForm()
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!formData.name.trim() || !editingCategory?.id) return

    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      })
      resetForm()
    } catch (error) {
      console.error("Error updating category:", error)
    }
  }

  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete?.id) return

    try {
      await deleteCategory.mutateAsync(categoryToDelete.id)
      setShowDeleteConfirm(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setCategoryToDelete(null)
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleSubmit = async () => {
    if (isEditing) {
      await handleUpdateCategory()
    } else {
      await handleCreateCategory()
    }
  }

  const isSubmitDisabled =
    !formData.name.trim() || (isEditing ? updateCategory.isPending : createCategory.isPending)

  return (
    <div className="p-6">
      {/* Existing Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Categories</h3>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{category.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{category.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-sm font-medium mb-1">No categories yet</div>
            <div className="text-xs">Create your first category below</div>
          </div>
        )}
      </div>

      {/* Add/Edit Category Form */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h3>
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700">Category Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-gray-700">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "expense" | "income") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700">Icon</Label>
            <div className="mt-1 grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {iconOptions.map((icon, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-gray-100 transition-colors ${
                    formData.icon === icon ? "bg-blue-100 border-2 border-blue-500" : ""
                  }`}
                  title={`Select ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-700">Color</Label>
            <div className="mt-1 grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-lg ${color.value} transition-all ${
                    formData.color === color.value
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "hover:scale-110"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <Label className="text-gray-700 mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.color} text-white text-lg`}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-medium text-gray-800">{formData.name || "Category Name"}</div>
                <div className="text-xs text-gray-500 capitalize">{formData.type}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Sheet */}
      <DeleteConfirmationSheet
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete"
        itemName={categoryToDelete?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isPending={deleteCategory.isPending}
        confirmText="Delete Category"
        additionalDetails={
          categoryToDelete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {categoryToDelete.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Icon:</span>
                <span className="font-medium text-gray-900">
                  {categoryToDelete.icon}
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}
