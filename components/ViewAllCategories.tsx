import { EditCategory } from "@/form/EditCategory"
import { useAuth } from "@/hooks"
import { useCategories, useDeleteCategoryMutation } from "@/hooks"
import { Edit2, Loader, Loader2, SquarePen, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { DeleteConfirmationSheet } from "./DeleteConfirmationSheet"

const ViewAllCategories = () => {
  const { user } = useAuth()
  // Get categories from API
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useCategories(user?.id || "", undefined, !!user?.id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }
  const deleteCategory = useDeleteCategoryMutation()
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
        {isError && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-red-500 mb-2">Error loading categories</p>
              <p className="text-sm text-gray-600">{error?.message || "Unknown error"}</p>
            </div>
          </div>
        )}
        {!isLoading && !isError && (!categories || categories.length === 0) && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-gray-500 mb-2">No categories found</p>
              <p className="text-sm text-gray-400">Categories array is empty or undefined</p>
            </div>
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
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-800">{category.name}</div>
                  {category.is_default && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 capitalize">{category.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditCategory
                trigger={
                  <button
                    className={`p-2 border rounded transition-colors ${
                      category.is_default
                        ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 hover:bg-white cursor-pointer"
                    }`}
                    title={category.is_default ? "Cannot edit default category" : "Edit category"}
                    disabled={category.is_default}
                  >
                    <SquarePen
                      size={18}
                      className={category.is_default ? "text-gray-300" : "text-gray-500"}
                    />
                  </button>
                }
                category={category}
              />

              <button
                onClick={() => !category.is_default && handleDeleteClick(category)}
                disabled={category.is_default}
                className={`p-2 border rounded transition-colors ${
                  category.is_default
                    ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                    : "border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer"
                }`}
                title={category.is_default ? "Cannot delete default category" : "Delete category"}
              >
                <Trash2
                  size={18}
                  className={category.is_default ? "text-gray-300" : "text-red-500"}
                />
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
