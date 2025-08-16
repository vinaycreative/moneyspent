"use client"
import React, { useEffect } from "react"
import { Drawer } from "vaul"
import { LucideIcon, Icon, Loader2 } from "lucide-react"
import { useMobileKeyboard } from "@/lib/hooks/use-mobile-keyboard"

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

  // Use controlled state if provided, otherwise use internal state
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  // Handle input focus to ensure visibility
  useEffect(() => {
    if (isOpen && isKeyboardVisible) {
      const handleFocus = (e: Event) => {
        const target = e.target as HTMLElement
        if (target && target.scrollIntoView) {
          // Scroll the focused element into view with a delay to account for keyboard animation
          setTimeout(() => {
            target.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            })
          }, 300)
        }
      }

      const inputs = document.querySelectorAll("input, select, textarea")
      inputs.forEach((input) => {
        input.addEventListener("focus", handleFocus as EventListener)
      })

      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("focus", handleFocus as EventListener)
        })
      }
    }
  }, [isOpen, isKeyboardVisible])

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger className={`relative ${triggerClassName}`} asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed min-w-[320px] max-w-[400px] mx-auto inset-0 bg-black/40" />
        <Drawer.Content
          className={`
            bg-white min-w-[320px] max-w-[400px] mx-auto flex flex-col z-[9999] rounded-t-[10px] 
            fixed bottom-0 left-0 right-0 outline-none transition-all duration-300
            ${isKeyboardVisible ? "max-h-[85vh] min-h-[60vh]" : "max-h-[96%] min-h-[80%]"}
            ${isKeyboardVisible ? "mt-8" : "mt-24"}
          `}
        >
          <div className="h-full flex-1 grid grid-rows-[auto_1fr_auto]">
            <div className="header bg-white border-b border-gray-200 px-4 py-3 rounded-t-[10px]">
              <Drawer.Title className="text-base font-semibold text-gray-800">
                {title}
              </Drawer.Title>
              {description && (
                <Drawer.Description className="text-sm text-gray-500">
                  {description}
                </Drawer.Description>
              )}
            </div>
            <div
              className={`
                body bg-[#fbfbfb] p-4 overflow-y-auto mobile-scroll
                ${isKeyboardVisible ? "pb-20" : ""}
              `}
            >
              {children}
            </div>
            <div className="footer bg-white border-t border-gray-200 flex items-center justify-center py-3 px-3">
              {customSubmitButton ? (
                customSubmitButton
              ) : (
                <button
                  className={`bg-black text-white flex items-center justify-center gap-2 font-medium hover:bg-gray-800 transition-colors w-full py-2.5 rounded-md ${submitClassName}`}
                  disabled={submitDisabled}
                  onClick={onSubmit}
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SubmitIcon size={20} className="w-4 h-4" />
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
