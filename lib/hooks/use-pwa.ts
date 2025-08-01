"use client"

import { useState, useEffect } from "react"

interface PWAStatus {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    deferredPrompt: null,
  })

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true

      setPwaStatus((prev) => ({ ...prev, isInstalled }))
    }

    // Handle online/offline status
    const handleOnlineStatus = () => {
      setPwaStatus((prev) => ({ ...prev, isOnline: navigator.onLine }))
    }

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaStatus((prev) => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e,
      }))
    }

    // Check installation status
    checkInstallation()

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (pwaStatus.deferredPrompt) {
      pwaStatus.deferredPrompt.prompt()
      const { outcome } = await pwaStatus.deferredPrompt.userChoice

      if (outcome === "accepted") {
        setPwaStatus((prev) => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null,
          isInstalled: true,
        }))
        return true
      } else {
        setPwaStatus((prev) => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null,
        }))
        return false
      }
    }
    return false
  }

  return {
    ...pwaStatus,
    installPWA,
  }
}
