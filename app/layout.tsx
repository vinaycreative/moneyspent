import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import TanstackProvider from "@/context/TanstackProvider"

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
      <head>
        <Script src="/sw-cleanup.js" strategy="afterInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 mobile-viewport`}
        suppressHydrationWarning
      >
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  )
}
