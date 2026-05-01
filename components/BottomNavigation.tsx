"use client"

import { Home, BarChart3, Building2, ArrowRightLeft, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { AddExpense } from "@/form/AddExpense"

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const leftItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Spend", icon: ArrowRightLeft, path: "/transactions" },
  ]

  const rightItems = [
    { name: "Stats", icon: BarChart3, path: "/analytics" },
    { name: "Accts", icon: Building2, path: "/accounts" },
  ]

  return (
    <div className="h-[70px] flex items-center bg-paper border-t border-line relative z-[2]">
      <div className="max-w-md mx-auto flex items-center justify-between w-full px-6">
        <div className="flex items-center gap-6">
          {leftItems.map((item) => {
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
                  className="text-[11px] transition-all duration-200"
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col items-center justify-center pointer-events-auto">
          <AddExpense
            trigger={
              <div className="w-[48px] h-[48px] bg-[#8B9DFE] rounded-full flex items-center justify-center shadow-md text-white cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <Plus size={24} strokeWidth={2.5} />
              </div>
            }
          />
        </div>

        <div className="flex items-center gap-6">
          {rightItems.map((item) => {
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
                  className="text-[11px] transition-all duration-200"
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
