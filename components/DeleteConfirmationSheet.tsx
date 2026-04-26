"use client"
import { Drawer } from "vaul"
import { Trash2 } from "lucide-react"
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
          className="flex flex-col rounded-t-[14px] h-[96%] min-w-[320px] max-w-[400px] mx-auto mt-24 fixed bottom-0 left-0 right-0 z-[9999] bg-surface"
          aria-labelledby="delete-drawer-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Drag handle */}
          <div className="pt-3 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-line-strong" />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-8">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-neg/10"
              >
                <Trash2 className="w-8 h-8 text-neg" />
              </div>
              <Drawer.Title
                className="text-xl font-bold mb-3 text-ink"
              >
                {title}
              </Drawer.Title>
              <p className="mb-6 text-ms-muted">
                {description}
                {itemName && <span className="font-medium text-ink"> &quot;{itemName}&quot;</span>}?
                This action cannot be undone.
              </p>

              {additionalDetails && (
                <div
                  className="rounded-xl p-4 mb-6 text-left bg-surface-alt border border-line"
                >
                  {additionalDetails}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="px-6 py-4 flex-shrink-0 space-y-3 border-t border-line"
          >
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="w-full cursor-pointer rounded-xl py-2.5 font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-neg text-white"
            >
              {isPending ? "Deleting…" : confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full cursor-pointer rounded-xl py-2.5 font-medium transition-colors bg-surface-alt text-ink border border-line"
            >
              {cancelText}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
