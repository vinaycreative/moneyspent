"use client"
import React from "react"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"
import AuthGuard from "@/components/AuthGuard"
import AuthErrorBoundary from "@/components/AuthErrorBoundary"
import { useAuth } from "@/hooks/useAuth"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <div>Not logged in</div>
  }
  return (
    <div className="h-dvh grid border-x border-gray-200 grid-rows-[1fr_70px] bg-white min-w-[320px] max-w-[400px] mx-auto mobile-viewport">
      {/* <Header title="Money Manager" /> */}
      <main className="overflow-y-auto mobile-scroll scrollbar-hide">{children}</main>
      <BottomNavigation />
    </div>
  )
}
