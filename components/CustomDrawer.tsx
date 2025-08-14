"use client"
import React from "react"
import { Drawer } from "vaul"
import { LucideIcon, Icon } from "lucide-react"

interface CustomDrawerProps {
  trigger: React.ReactNode
  triggerClassName?: string
  title: string
  description?: string
  children: React.ReactNode
  SubmitIcon: LucideIcon
  submitTitle?: string
  submitDisabled?: boolean
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
}: CustomDrawerProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger className={`relative ${triggerClassName}`} asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-gray-100 flex flex-col z-[9999] rounded-t-[10px] mt-24 max-h-[96%] min-h-[80%] fixed bottom-0 left-0 right-0 outline-none">
          <div className="h-full flex-1 grid grid-rows-[auto_1fr_auto]">
            <div className="header bg-white border-b border-gray-200 px-4 py-4">
              <Drawer.Title className="text-lg font-bold text-black">{title}</Drawer.Title>
              {description && (
                <Drawer.Description className="text-sm text-gray-500">
                  {description}
                </Drawer.Description>
              )}
            </div>
            <div className="body bg-gray-100 p-4">{children}</div>
            <div className="footer bg-white border-t border-gray-200 flex items-center justify-center py-4 px-4">
              <button
                className="bg-blue-600 text-white flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition-colors w-full py-4 rounded-lg"
                disabled={submitDisabled}
              >
                <SubmitIcon size={20} className="w-4 h-4" />
                {submitTitle}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default CustomDrawer
