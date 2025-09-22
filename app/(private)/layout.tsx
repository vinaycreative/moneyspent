"use client"
import React from "react"
import BottomNavigation from "@/components/BottomNavigation"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  if (!user) {
    router.push("/auth/login")
  }
  return (
    <div className="h-dvh grid border-x border-gray-200 grid-rows-[1fr_70px] bg-white min-w-[320px] max-w-[400px] mx-auto mobile-viewport">
      {/* <Header title="Money Manager" /> */}
      <main className="overflow-y-auto mobile-scroll scrollbar-hide">{children}</main>
      <BottomNavigation />
    </div>
  )
}
