import { EditCategory } from "@/form/EditCategory"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCategories, useDeleteCategory } from "@/lib/hooks"
import { Edit2, Loader, Loader2, SquarePen, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { DeleteConfirmationSheet } from "./DeleteConfirmationSheet"

const ViewAllCategories = () => {
  const { user } = useAuth()
  // Get categories from API
  const { data: categories, isLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }
  const deleteCategory = useDeleteCategory()
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-2 h-[calc(100vh-18rem)] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader size={34} className="animate-spin text-gray-500" />
          </div>
        )}
        {categories?.map((category: any) => (
          <div
            key={category.id}
            className="flex items-center justify-between px-3 py-2.5 bg-white rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-sm flex items-center justify-center ${category.color} text-white text-sm`}
              >
                {category.icon}
              </div>
              <div>
                <div className="font-medium text-gray-800">{category.name}</div>
                <div className="text-xs text-gray-500 capitalize">{category.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditCategory
                trigger={
                  <button
                    className="p-2 border border-gray-300 bg-gray-50 hover:bg-white rounded transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    {/* <Edit2 className="w-4 h-4 text-blue-500" /> */}
                    <SquarePen size={18} className="text-gray-500" />
                  </button>
                }
                category={category}
              />

              <button
                onClick={() => handleDeleteClick(category)}
                className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-colors cursor-pointer"
                title="Delete category"
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
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
                <div className="font-medium text-gray-900">{categoryToDelete.icon}</div>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}

export default ViewAllCategories
