"use client"
import React from "react"
import BottomNavigation from "@/components/BottomNavigation"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  )
}
