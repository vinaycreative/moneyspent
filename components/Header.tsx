"use client"

import { ArrowLeft, Menu } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  showMenuButton?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
  rightAction?: React.ReactNode
}

export default function Header({
  title,
  showBackButton = false,
  showMenuButton = false,
  onBackClick,
  onMenuClick,
  rightAction,
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/transactions":
        return "Transactions"
      case "/analytics":
        return "Analytics"
      case "/accounts":
        return "Accounts"
      case "/settings":
        return "Settings"
      default:
        return title
    }
  }

  return (
    <div
      className="h-[60px] flex items-center bg-surface border-b border-line"
    >
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button onClick={handleBackClick} className="p-2 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-ms-muted" />
              </button>
            )}
            {showMenuButton && (
              <button onClick={onMenuClick} className="p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5 text-ms-muted" />
              </button>
            )}
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-lg font-bold text-ink">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            {rightAction}
            {!rightAction && (showBackButton || showMenuButton) && <div className="w-9 h-9"></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
