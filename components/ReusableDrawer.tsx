"use client"

import { Drawer } from "vaul"
import { X } from "lucide-react"
import { ReactNode, memo, useEffect } from "react"

interface ReusableDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onCancel: () => void
  onSubmit: () => void
  submitTitle: string
  submitIcon?: ReactNode
  submitDisabled?: boolean
  children: ReactNode
}

export const ReusableDrawer = memo(function ReusableDrawer({
  isOpen,
  onOpenChange,
  title,
  onCancel,
  onSubmit,
  submitTitle,
  submitIcon,
  submitDisabled = false,
  children,
}: ReusableDrawerProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[9998]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-[9998]">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Action - Fixed */}
          {submitTitle && (
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={onSubmit}
                disabled={submitDisabled}
                className="w-full bg-gray-800 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitIcon && <span>{submitIcon}</span>}
                {submitTitle}
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
})
