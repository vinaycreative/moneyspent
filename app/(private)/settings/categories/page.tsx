"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Loader, SquarePen, Trash2 } from "lucide-react"
import { AddCategory } from "@/form/AddCategory"
import { EditCategory } from "@/form/EditCategory"
import { useAuth, useCategories, useDeleteCategoryMutation } from "@/hooks"
import { DeleteConfirmationSheet } from "@/components/DeleteConfirmationSheet"
import { cn } from "@/lib/utils"
import Page from "@/components/layout/Page"
import { motion } from "framer-motion"

export default function CategoriesSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    data: categories,
    isLoading,
    isError,
  } = useCategories(user?.id || "", undefined, !!user?.id)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const deleteCategory = useDeleteCategoryMutation()
  const [activeTab, setActiveTab] = useState("expense")

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

  // Helper to safely get the background style for a category icon.
  // Some legacy DB entries might have "bg-red-400" instead of "#F87171".
  const getIconStyle = (colorStr: string) => {
    if (colorStr?.startsWith("bg-")) return {}
    return { backgroundColor: colorStr }
  }
  const getIconClass = (colorStr: string) => {
    if (colorStr?.startsWith("bg-")) return colorStr
    return ""
  }

  const renderCategoryGroup = (title: string | null, items: any[]) => {
    if (!items || items.length === 0)
      return (
        <div className="text-center py-10 px-6 bg-surface border border-line rounded-2xl ">
          <p className="text-ms-muted text-sm font-medium">No categories found.</p>
        </div>
      )
    return (
      <div className="mb-8">
        {title && (
          <h2 className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-3 pl-2">
            {title}
          </h2>
        )}
        <div className="bg-surface border border-line rounded-2xl overflow-hidden ">
          {items.map((category, idx) => {
            const isLast = idx === items.length - 1
            return (
              <div
                key={category.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 transition-colors bg-surface",
                  !isLast && "border-b border-line",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl  border border-white/5",
                      getIconClass(category.color),
                    )}
                    style={getIconStyle(category.color)}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{category.name}</span>
                      {category.is_default && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold bg-white/5 text-ms-muted">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EditCategory
                    trigger={
                      <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-white/5 hover:bg-white/10">
                        <SquarePen size={16} className="text-ink" />
                      </button>
                    }
                    category={category}
                  />
                  {!category.is_default && (
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-neg/10 hover:bg-neg/20 text-neg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const expenseCategories = categories?.filter((c: any) => c.type === "expense") || []
  const incomeCategories = categories?.filter((c: any) => c.type === "income") || []

  return (
    <Page className="overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-paper/80 backdrop-blur-xl pt-4 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center active:bg-surface-alt transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-ink" />
        </button>
        <h1 className="text-lg font-bold text-ink">Categories</h1>

        <AddCategory
          trigger={
            <button className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center active:bg-surface-alt transition-colors">
              <Plus className="w-6 h-6 text-ink" />
            </button>
          }
        />
      </div>

      <div className="pt-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="animate-spin text-ms-muted" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-neg font-medium">Failed to load categories.</p>
          </div>
        )}

        {!isLoading && !isError && categories?.length === 0 && (
          <div className="text-center py-20 px-6">
            <p className="text-ink font-bold mb-2">No categories yet</p>
            <p className="text-ms-muted text-sm mb-6">
              Create categories to start organizing your transactions.
            </p>
            <AddCategory
              trigger={
                <button className="bg-white text-black font-bold h-12 px-8 rounded-full shadow-[0_2px_20px_rgba(255,255,255,0.15)] active:scale-95 transition-transform">
                  Create Category
                </button>
              }
            />
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="w-full">
            {/* Custom Premium Tab Switcher */}
            <div className="flex bg-surface p-1 rounded-full mb-6 border border-line relative">
              {["expense", "income"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative flex-1 py-3 text-sm font-bold rounded-full transition-colors z-10 capitalize",
                    activeTab === tab ? "text-black" : "text-ms-muted hover:text-ink",
                  )}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="categoryTabPill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.1)] -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="outline-none">
              {activeTab === "expense" ? (
                <motion.div
                  key="expense-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCategoryGroup(null, expenseCategories)}
                </motion.div>
              ) : (
                <motion.div
                  key="income-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCategoryGroup(null, incomeCategories)}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationSheet
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete"
        itemName={categoryToDelete?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isPending={deleteCategory.isPending}
        confirmText="Delete Category"
        additionalDetails={
          categoryToDelete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Type:</span>
                <span className="font-bold capitalize text-ink">{categoryToDelete.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ms-muted">Icon:</span>
                <div className="font-bold text-ink text-xl">{categoryToDelete.icon}</div>
              </div>
            </div>
          )
        }
      />
    </Page>
  )
}
