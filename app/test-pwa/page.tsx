"use client"

import { useEffect, useState } from "react"
import { Download, CheckCircle, XCircle, Wifi, WifiOff, RefreshCw } from "lucide-react"

declare global {
  interface Window {
    installPWA?: () => void
    deferredPrompt?: any
  }
}

export default function TestPWAPage() {
  const [pwaStatus, setPwaStatus] = useState({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    deferredPrompt: null as any,
    serviceWorkerSupported: false,
    manifestLoaded: false,
    iconsAccessible: false,
  })

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true

      setPwaStatus(prev => ({ ...prev, isInstalled }))
    }

    // Handle online/offline status
    const handleOnlineStatus = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired")
      e.preventDefault()
      setPwaStatus(prev => ({ 
        ...prev, 
        canInstall: true, 
        deferredPrompt: e 
      }))
    }

    // Check service worker support
    const checkServiceWorker = () => {
      setPwaStatus(prev => ({ 
        ...prev, 
        serviceWorkerSupported: "serviceWorker" in navigator 
      }))
    }

    // Check manifest
    const checkManifest = async () => {
      try {
        const response = await fetch("/manifest.json")
        if (response.ok) {
          const manifest = await response.json()
          setPwaStatus(prev => ({ 
            ...prev, 
            manifestLoaded: true 
          }))
          console.log("Manifest loaded:", manifest)
        }
      } catch (error) {
        console.error("Failed to load manifest:", error)
      }
    }

    // Check icons
    const checkIcons = async () => {
      try {
        const response = await fetch("/icon-192x192.png")
        setPwaStatus(prev => ({ 
          ...prev, 
          iconsAccessible: response.ok 
        }))
      } catch (error) {
        console.error("Failed to load icons:", error)
      }
    }

    // Initialize checks
    checkInstallation()
    checkServiceWorker()
    checkManifest()
    checkIcons()

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

  const handleInstall = async () => {
    if (pwaStatus.deferredPrompt) {
      console.log("Manually triggering install prompt")
      pwaStatus.deferredPrompt.prompt()
      const { outcome } = await pwaStatus.deferredPrompt.userChoice
      
      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
        setPwaStatus(prev => ({ 
          ...prev, 
          canInstall: false, 
          deferredPrompt: null,
          isInstalled: true 
        }))
      } else {
        console.log("User dismissed the install prompt")
        setPwaStatus(prev => ({ 
          ...prev, 
          canInstall: false, 
          deferredPrompt: null 
        }))
      }
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PWA Debug Test</h1>
        
        <div className="space-y-4">
          {/* Installation Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Installation Status</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {pwaStatus.isInstalled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {pwaStatus.isInstalled ? "App is installed" : "App is not installed"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {pwaStatus.canInstall ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {pwaStatus.canInstall ? "Can install app" : "Cannot install app"}
                </span>
              </div>
            </div>
            
            {pwaStatus.canInstall && !pwaStatus.isInstalled && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>

          {/* Technical Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Technical Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {pwaStatus.serviceWorkerSupported ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Service Worker Supported</span>
              </div>
              
              <div className="flex items-center gap-2">
                {pwaStatus.manifestLoaded ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Manifest Loaded</span>
              </div>
              
              <div className="flex items-center gap-2">
                {pwaStatus.iconsAccessible ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Icons Accessible</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Connection Status</h2>
            <div className="flex items-center gap-2">
              {pwaStatus.isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">{pwaStatus.isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleRefresh}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              
              <button
                onClick={() => window.open("/manifest.json", "_blank")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Manifest
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-3">Debug Info</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <div>Check browser console for detailed logs</div>
              <div>Open DevTools → Application tab</div>
              <div>Look for "beforeinstallprompt" events</div>
              <div>Verify service worker is registered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 