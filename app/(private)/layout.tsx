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
      <div
        className="h-svh flex items-center justify-center bg-paper"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto border-ms-accent"
          />
          <p className="mt-2 text-sm text-ms-muted">
            Loading…
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
    <main
      className="h-[calc(100dvh-70px)] min-w-[320px] max-w-[400px] mx-auto mobile-viewport bg-paper mobile-scroll scrollbar-hide"
    >
      {/* <main className="overflow-y-auto mobile-scroll scrollbar-hide">{children}</main> */}
      {children}
    </main>
      <BottomNavigation />
    </>
  )
}
