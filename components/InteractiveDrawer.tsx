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
  children,
}: InteractiveDrawerProps) => {
  const { isKeyboardVisible } = useMobileKeyboard()

  const handleOpenChange = (open: boolean) => {
    if (open && onOpen) {
      onOpen()
    }
    onOpenChange(open)
  }

  return (
    <>
      {trigger && <div onClick={() => handleOpenChange(true)}>{trigger}</div>}

      <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none flex flex-col",
              "transition-all duration-300 ease-in-out"
            )}
            style={{ 
              maxHeight: isKeyboardVisible ? 'calc(100dvh - 20px)' : '96dvh'
            }}
          >
            <div className="rounded-t-[32px] overflow-hidden bg-paper shadow-[0_-8px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_60px_rgba(0,0,0,0.5)] border border-line flex flex-col h-full">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-ink/10 dark:bg-white/15" />
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X size={17} className="text-ms-muted" />
                </button>

                <Drawer.Title className="text-sm font-bold text-ms-muted uppercase tracking-[0.15em]">
                  {title}
                </Drawer.Title>

                {submitText ? (
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

              {/* Content area - scrollable if needed */}
              <div className="overflow-y-auto flex-1 pb-safe">
                {children}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
