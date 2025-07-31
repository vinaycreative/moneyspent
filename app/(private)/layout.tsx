import React from "react"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh grid grid-rows-[1fr_70px] bg-gray-50">
      {/* <Header title="Money Manager" /> */}
      <main className="overflow-y-auto">{children}</main>
      <BottomNavigation />
    </div>
  )
}
