"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

declare global {
  interface Window {
    installPWA?: () => void
    deferredPrompt?: any
  }
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    console.log("PWA Install Prompt component mounted")

    // Check if the app is already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    console.log("App installed check:", isInstalled)

    if (isInstalled) {
      console.log("App is already installed, not showing prompt")
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("🎉 beforeinstallprompt event fired!")
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Also check if we already have a deferred prompt
    if ((window as any).deferredPrompt) {
      console.log("Found existing deferred prompt")
      setDeferredPrompt((window as any).deferredPrompt)
      setShowPrompt(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      console.log("Manually triggering install prompt")
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Install Money Manager</h3>
            <p className="text-gray-600 text-xs mt-1">
              Add to your home screen for quick access and offline use
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
