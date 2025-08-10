"use client"

import { Drawer } from "vaul"
import { X, Trash2 } from "lucide-react"
import { ReactNode } from "react"

interface DeleteConfirmationSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName?: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  confirmText?: string
  cancelText?: string
  additionalDetails?: ReactNode
}

export function DeleteConfirmationSheet({
  isOpen,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
  isPending = false,
  confirmText = "Delete",
  cancelText = "Cancel",
  additionalDetails,
}: DeleteConfirmationSheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Delete Confirmation</h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 mb-6">
                {description}
                {itemName && (
                  <span className="font-medium text-gray-900"> "{itemName}"</span>
                )}
                ? This action cannot be undone.
              </p>
              
              {/* Additional Details */}
              {additionalDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  {additionalDetails}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 space-y-3">
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="w-full bg-red-500 text-white rounded-lg py-3 font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Deleting..." : confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
