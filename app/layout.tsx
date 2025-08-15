import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/lib/contexts/auth-context"
import PrivateLayout from "./(private)/layout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MoneySpend - Your Personal Finance Manager",
  description: "Track expenses, manage budgets, and achieve your financial goals with MoneySpend",
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 mobile-viewport`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
