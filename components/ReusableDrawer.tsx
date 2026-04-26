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
        <Drawer.Content
          className="flex flex-col rounded-t-[14px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-[9998] min-w-[320px] max-w-[400px] mx-auto bg-surface"
        >
          {/* Drag handle */}
          <div className="pt-3 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-line-strong" />
          </div>
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-line"
          >
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <button onClick={onCancel} className="p-2 rounded-lg transition-colors">
              <X className="w-5 h-5 text-ms-muted" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto bg-surface-alt">{children}</div>

          {/* Footer */}
          {submitTitle && (
            <div
              className="px-6 py-4 flex-shrink-0 border-t border-line bg-surface"
            >
              <button
                onClick={onSubmit}
                disabled={submitDisabled}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed bg-ink text-paper"
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
