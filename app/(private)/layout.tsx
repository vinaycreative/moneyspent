import React from "react"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh grid border-x border-gray-200 grid-rows-[1fr_70px] bg-white min-w-[320px] max-w-[400px] mx-auto mobile-viewport">
      {/* <Header title="Money Manager" /> */}
      <main className="overflow-y-auto mobile-scroll">{children}</main>
      <BottomNavigation />
    </div>
  )
}
