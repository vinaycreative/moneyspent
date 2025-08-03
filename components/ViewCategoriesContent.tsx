"use client"

import { Edit2, Trash2, Tag, Plus } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCategories, useDeleteCategory } from "@/lib/hooks"

interface ViewCategoriesContentProps {
  onClose: () => void
  onAddCategory: () => void
  onEditCategory: (category: any) => void
}

export function ViewCategoriesContent({
  onClose,
  onAddCategory,
  onEditCategory,
}: ViewCategoriesContentProps) {
  const { user } = useAuth()

  // Get categories from API
  const { data: categories, isLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })

  const deleteCategory = useDeleteCategory()

  const handleDeleteCategory = async (categoryId: string) => {
    if (!categoryId) return

    try {
      await deleteCategory.mutateAsync(categoryId)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Categories</h3>
        <p className="text-sm text-gray-500">
          Manage your transaction categories. You can edit or delete existing categories.
        </p>
      </div>

      {/* Categories List */}
      <div className="mb-6">
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
                    onClick={() => onEditCategory(category)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
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
            <div className="text-xs">Create your first category to get started</div>
          </div>
        )}
      </div>

      {/* Add Category Button */}
      <div className="border-t pt-6">
        <button
          onClick={onAddCategory}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white rounded-lg py-3 font-medium hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </div>
    </div>
  )
} 