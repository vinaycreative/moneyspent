"use client"

import { Home, BarChart3, Building2, Settings, ArrowRightLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: "Home",         icon: Home,            path: "/dashboard"     },
    { name: "Transactions", icon: ArrowRightLeft,  path: "/transactions"  },
    { name: "Analytics",    icon: BarChart3,        path: "/analytics"     },
    { name: "Accounts",     icon: Building2,        path: "/accounts"      },
    { name: "Settings",     icon: Settings,         path: "/settings"      },
  ]

  return (
    <div
      className="h-[70px] flex items-center z-[2] bg-paper border-t border-line"
    >
      <div className="max-w-md mx-auto flex items-center justify-around w-full px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/")

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 p-2 cursor-pointer transition-all duration-200 ${isActive ? "text-ms-accent" : "text-ms-muted"}`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.2 : 1.7} />
              <span
                className="text-xs transition-all duration-200"
                style={{ fontWeight: isActive ? 600 : 500 }}
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
