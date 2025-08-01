import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/BottomNavigation"
import Header from "@/components/Header"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/lib/contexts/auth-context"
import PrivateLayout from "./(private)/layout"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Money Manager",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Money Manager",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <PWAInstallPrompt />
            <ServiceWorkerRegistration />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
