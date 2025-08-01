"use client"

import { usePWA } from "@/lib/hooks/use-pwa"
import { Download, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react"

export default function PWATestPage() {
  const { isInstalled, canInstall, isOnline, installPWA } = usePWA()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PWA Test Page</h1>

        <div className="space-y-4">
          {/* Installation Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Installation Status</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {isInstalled ? "App is installed" : "App is not installed"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {canInstall ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {canInstall ? "Can install app" : "Cannot install app"}
                </span>
              </div>
            </div>

            {canInstall && !isInstalled && (
              <button
                onClick={installPWA}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>

          {/* Online Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Connection Status</h2>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* PWA Features */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">PWA Features</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div>✅ Web App Manifest</div>
              <div>✅ Service Worker</div>
              <div>✅ Offline Support</div>
              <div>✅ Install Prompt</div>
              <div>✅ Responsive Design</div>
            </div>
          </div>

          {/* Testing Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-3">Testing Instructions</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <div>1. Open Chrome DevTools (F12)</div>
              <div>2. Go to Application tab</div>
              <div>3. Check "Manifest" section</div>
              <div>4. Check "Service Workers" section</div>
              <div>5. Test offline functionality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
