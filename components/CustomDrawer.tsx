"use client"
import React, { useEffect } from "react"
import { Drawer } from "vaul"
import { LucideIcon, Loader2 } from "lucide-react"
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard"

interface CustomDrawerProps {
  trigger: React.ReactNode
  triggerClassName?: string
  title: string
  description?: string
  children: React.ReactNode
  SubmitIcon: LucideIcon
  submitTitle?: string
  submitDisabled?: boolean
  submitLoading?: boolean
  onSubmit?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  submitClassName?: string
  customSubmitButton?: React.ReactNode
}

const CustomDrawer = ({
  trigger,
  triggerClassName,
  title,
  description,
  children,
  SubmitIcon,
  submitTitle,
  submitDisabled,
  submitLoading,
  onSubmit,
  open,
  onOpenChange,
  submitClassName,
  customSubmitButton,
}: CustomDrawerProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const { isKeyboardVisible } = useMobileKeyboard()

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  useEffect(() => {
    if (isOpen && isKeyboardVisible) {
      const handleFocus = (e: Event) => {
        const target = e.target as HTMLElement
        if (target?.scrollIntoView) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
          }, 300)
        }
      }
      const inputs = document.querySelectorAll("input, select, textarea")
      inputs.forEach((input) => input.addEventListener("focus", handleFocus as EventListener))
      return () => {
        inputs.forEach((input) => input.removeEventListener("focus", handleFocus as EventListener))
      }
    }
  }, [isOpen, isKeyboardVisible])

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger className={`relative ${triggerClassName}`} asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed min-w-[320px] max-w-[400px] mx-auto inset-0 bg-black/50" />
        <Drawer.Content
          className={`
            min-w-[320px] max-w-[400px] mx-auto flex flex-col z-[9999] rounded-t-[14px]
            fixed bottom-0 left-0 right-0 outline-none transition-all duration-300
            ${isKeyboardVisible ? "max-h-[85vh] min-h-[60vh]" : "max-h-[96%] min-h-[80%]"}
            ${isKeyboardVisible ? "mt-8" : "mt-24"} bg-surface
          `}
        >
          <div className="h-full flex-1 grid grid-rows-[auto_1fr_auto]">
            {/* Header */}
            <div
              className="px-4 py-3 rounded-t-[14px] bg-surface border-b border-line"
            >
              {/* Drag handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto mb-3 bg-line-strong"
              />
              <Drawer.Title
                className="text-base font-semibold text-ink"
              >
                {title}
              </Drawer.Title>
              {description && (
                <Drawer.Description
                  className="text-sm mt-0.5 text-ms-muted"
                >
                  {description}
                </Drawer.Description>
              )}
            </div>

            {/* Body */}
            <div
              className={`p-4 overflow-y-auto mobile-scroll bg-surface-alt ${isKeyboardVisible ? "pb-20" : ""}`}
            >
              {children}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center py-3 px-3 bg-surface border-t border-line"
            >
              {customSubmitButton ? (
                customSubmitButton
              ) : (
                <button
                  className={`flex items-center justify-center gap-2 font-semibold transition-opacity w-full py-2.5 rounded-xl disabled:opacity-50 bg-ink text-paper text-[14.5px] ${submitClassName ?? ""}`}
                  disabled={submitDisabled}
                  onClick={onSubmit}
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SubmitIcon size={16} />
                  )}
                  {submitTitle}
                </button>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default CustomDrawer
