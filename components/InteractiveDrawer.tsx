import React from "react"
import { Drawer } from "vaul"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard"

export interface InteractiveDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onOpen?: () => void
  title: string
  trigger?: React.ReactNode

  // Header Actions
  isSubmitDisabled?: boolean
  isLoading?: boolean
  onSubmit: () => void
  submitText?: React.ReactNode
  showSubmit?: boolean

  // Content
  children: React.ReactNode
}

export const InteractiveDrawer = ({
  isOpen,
  onClose,
  onOpenChange,
  onOpen,
  title,
  trigger,
  isSubmitDisabled,
  isLoading,
  onSubmit,
  submitText = "Save",
  showSubmit = true,
  children,
}: InteractiveDrawerProps) => {
  const { isKeyboardVisible } = useMobileKeyboard()

  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (onOpen) onOpen()
      onOpenChange(true)
    } else {
      onOpenChange(false)
      onClose()
    }
  }

  return (
    <>
      {trigger && <div onClick={() => handleOpenChange(true)}>{trigger}</div>}

      <Drawer.Root 
        open={isOpen} 
        onOpenChange={handleOpenChange}
        repositionInputs={false} // We handle this manually for better control
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm" />
          <Drawer.Content
            className="flex flex-col bg-paper rounded-t-[32px] h-full max-h-[96dvh] fixed bottom-0 left-0 right-0 z-[9998] max-w-md mx-auto focus:outline-none"
          >
            <div className="flex flex-col h-full w-full overflow-hidden rounded-t-[32px] border border-line relative">
              {/* Drag handle */}
              <div className="pt-3 flex justify-center shrink-0">
                <div className="w-10 h-1 rounded-full bg-line-strong" />
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0 bg-paper z-10">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X size={17} className="text-ms-muted" />
                </button>

                <Drawer.Title className="text-[11px] font-bold text-ms-muted uppercase tracking-[0.2em] opacity-70">
                  {title}
                </Drawer.Title>

                {showSubmit && submitText ? (
                  <button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled || isLoading}
                    className={cn(
                      "h-9 px-4 rounded-full text-sm font-bold transition-all active:scale-95",
                      isSubmitDisabled || isLoading
                        ? "bg-surface-alt text-ms-muted"
                        : "bg-ink text-paper ",
                    )}
                  >
                    {isLoading ? "Saving…" : submitText}
                  </button>
                ) : (
                  <div className="w-9" />
                )}
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-safe">
                {children}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
