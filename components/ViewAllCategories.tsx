import { EditCategory } from "@/form/EditCategory"
import { useAuth } from "@/hooks"
import { useCategories, useDeleteCategoryMutation } from "@/hooks"
import { Loader, SquarePen, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { DeleteConfirmationSheet } from "./DeleteConfirmationSheet"

const ViewAllCategories = () => {
  const { user } = useAuth()
  const { data: categories, isLoading, isError, error } = useCategories(user?.id || "", undefined, !!user?.id)
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
            <Loader size={34} className="animate-spin text-ms-muted" />
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="mb-2 text-neg">Error loading categories</p>
              <p className="text-sm text-ms-muted">{error?.message || "Unknown error"}</p>
            </div>
          </div>
        )}
        {!isLoading && !isError && (!categories || categories.length === 0) && (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="mb-2 text-ms-muted">No categories found</p>
              <p className="text-sm text-ms-muted/70">Categories array is empty or undefined</p>
            </div>
          </div>
        )}
        {categories?.map((category: any) => (
          <div
            key={category.id}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors bg-surface border border-line"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}>
                {category.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-ink">{category.name}</div>
                  {category.is_default && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium bg-ms-accent/15 text-ms-accent border border-ms-accent/30"
                    >
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs capitalize text-ms-muted">{category.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditCategory
                trigger={
                  <button
                    className={`p-2 rounded-lg transition-colors border border-line ${category.is_default ? "bg-surface-alt cursor-not-allowed opacity-50" : "bg-surface cursor-pointer opacity-100"}`}
                    title={category.is_default ? "Cannot edit default category" : "Edit category"}
                    disabled={category.is_default}
                  >
                    <SquarePen size={18} className="text-ms-muted" />
                  </button>
                }
                category={category}
              />
              <button
                onClick={() => !category.is_default && handleDeleteClick(category)}
                disabled={category.is_default}
                className={`p-2 rounded-lg transition-colors border ${category.is_default ? "border-line bg-surface-alt cursor-not-allowed opacity-40" : "border-neg/30 bg-neg/10 cursor-pointer opacity-100"}`}
                title={category.is_default ? "Cannot delete default category" : "Delete category"}
              >
                <Trash2 size={18} className={category.is_default ? "text-ms-muted" : "text-neg"} />
              </button>
            </div>
          </div>
        ))}
      </div>
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
                <span className="text-sm text-ms-muted">Type:</span>
                <span className="font-medium capitalize text-ink">{categoryToDelete.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Icon:</span>
                <div className="font-medium text-ink">{categoryToDelete.icon}</div>
              </div>
            </div>
          )
        }
      />
    </div>
  )
}

export default ViewAllCategories
