import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/lib/contexts/auth-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Money Manager",
  description: "Track your finances with ease",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <div className="h-dvh grid grid-rows-[60px_1fr_70px] bg-white">
              <Header title="Money Manager" />
              <main className="overflow-y-auto">{children}</main>
              <BottomNavigation />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
