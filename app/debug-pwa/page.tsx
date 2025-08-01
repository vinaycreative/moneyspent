"use client"

import { useEffect, useState } from "react"
import {
  Download,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

export default function DebugPWAPage() {
  const [debugInfo, setDebugInfo] = useState({
    serviceWorkerSupported: false,
    manifestLoaded: false,
    iconsAccessible: false,
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    beforeinstallpromptFired: false,
    deferredPrompt: null as any,
    consoleLogs: [] as string[],
  })

  useEffect(() => {
    const logs: string[] = []
    const addLog = (message: string) => {
      logs.push(`${new Date().toLocaleTimeString()}: ${message}`)
      setDebugInfo((prev) => ({ ...prev, consoleLogs: [...logs] }))
      console.log(message)
    }

    addLog("PWA Debug started")

    // Check service worker support
    const checkServiceWorker = () => {
      const supported = "serviceWorker" in navigator
      setDebugInfo((prev) => ({ ...prev, serviceWorkerSupported: supported }))
      addLog(`Service Worker supported: ${supported}`)
    }

    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true

      setDebugInfo((prev) => ({ ...prev, isInstalled }))
      addLog(`App installed: ${isInstalled}`)
    }

    // Check manifest
    const checkManifest = async () => {
      try {
        const response = await fetch("/manifest.json")
        if (response.ok) {
          const manifest = await response.json()
          setDebugInfo((prev) => ({ ...prev, manifestLoaded: true }))
          addLog(`Manifest loaded: ${manifest.name}`)
        } else {
          addLog(`Manifest failed to load: ${response.status}`)
        }
      } catch (error) {
        addLog(`Manifest error: ${error}`)
      }
    }

    // Check icons
    const checkIcons = async () => {
      try {
        const response = await fetch("/icon-192x192.png")
        setDebugInfo((prev) => ({ ...prev, iconsAccessible: response.ok }))
        addLog(`Icons accessible: ${response.ok}`)
      } catch (error) {
        addLog(`Icons error: ${error}`)
      }
    }

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      addLog("🎉 beforeinstallprompt event fired!")
      e.preventDefault()
      setDebugInfo((prev) => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e,
        beforeinstallpromptFired: true,
      }))
    }

    // Handle online/offline
    const handleOnlineStatus = () => {
      setDebugInfo((prev) => ({ ...prev, isOnline: navigator.onLine }))
      addLog(`Connection: ${navigator.onLine ? "Online" : "Offline"}`)
    }

    // Initialize checks
    checkServiceWorker()
    checkInstallation()
    checkManifest()
    checkIcons()

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check for existing service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        addLog(`Service Worker registrations: ${registrations.length}`)
        registrations.forEach((registration, index) => {
          addLog(
            `SW ${index + 1}: ${registration.scope} - ${
              registration.active ? "active" : "inactive"
            }`
          )
        })
      })
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (debugInfo.deferredPrompt) {
      console.log("Manually triggering install prompt")
      debugInfo.deferredPrompt.prompt()
      const { outcome } = await debugInfo.deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
        setDebugInfo((prev) => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null,
          isInstalled: true,
        }))
      } else {
        console.log("User dismissed the install prompt")
        setDebugInfo((prev) => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null,
        }))
      }
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PWA Debug Console</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">PWA Requirements</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {debugInfo.serviceWorkerSupported ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Service Worker Supported</span>
                </div>

                <div className="flex items-center gap-2">
                  {debugInfo.manifestLoaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Manifest Loaded</span>
                </div>

                <div className="flex items-center gap-2">
                  {debugInfo.iconsAccessible ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Icons Accessible</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Installation Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {debugInfo.isInstalled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    {debugInfo.isInstalled ? "App is installed" : "App is not installed"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {debugInfo.canInstall ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    {debugInfo.canInstall ? "Can install app" : "Cannot install app"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {debugInfo.beforeinstallpromptFired ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    {debugInfo.beforeinstallpromptFired
                      ? "beforeinstallprompt fired"
                      : "beforeinstallprompt not fired"}
                  </span>
                </div>
              </div>

              {debugInfo.canInstall && !debugInfo.isInstalled && (
                <button
                  onClick={handleInstall}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Connection Status</h2>
              <div className="flex items-center gap-2">
                {debugInfo.isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">{debugInfo.isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>

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
          </div>

          {/* Console Logs */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Debug Console</h2>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono h-96 overflow-y-auto">
              {debugInfo.consoleLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {debugInfo.consoleLogs.length === 0 && (
                <div className="text-gray-500">No logs yet...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
