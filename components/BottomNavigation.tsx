"use client"

import { Home, Receipt, BarChart3, Building2, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Transactions", icon: Receipt, path: "/transactions" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Accounts", icon: Building2, path: "/accounts" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-1 p-2"
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
              <span
                className={`text-xs font-medium ${isActive ? "text-purple-600" : "text-gray-400"}`}
              >
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
