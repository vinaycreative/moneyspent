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
        <Drawer.Overlay className="fixed min-w-[320px] max-w-[400px] mx-auto inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="bg-white flex flex-col rounded-t-[10px] h-[96%] min-w-[320px] max-w-[400px] mx-auto mt-24 fixed bottom-0 left-0 right-0 z-[9999]"
          aria-labelledby="delete-drawer-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <Drawer.Title className="text-xl font-bold text-gray-900 mb-3">{title}</Drawer.Title>
              <p className="text-gray-600 mb-6">
                {description}
                {itemName && <span className="font-medium text-gray-900"> "{itemName}"</span>}?
                This action cannot be undone.
              </p>

              {/* Additional Details */}
              {additionalDetails && (
                <div className="bg-gray-50 rounded-md p-4 mb-6 text-left border border-gray-200">
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
              className="w-full cursor-pointer bg-red-600 text-white rounded-md py-2.5 font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Deleting..." : confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full cursor-pointer bg-gray-100 text-gray-700 rounded-md border border-gray-200 py-2.5 font-medium hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
