"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're offline</h1>

        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again. Some features may be limited while
          offline.
        </p>

        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <div className="mt-8 text-sm text-gray-500">
          <p>MoneySpend works offline for viewing cached data.</p>
          <p className="mt-1">New transactions will sync when you're back online.</p>
        </div>
      </div>
    </div>
  )
}
