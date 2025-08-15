"use client"

import GoogleOneTapComponent from "@/components/GoogleOneTap"

export default function Home() {
  return (
    <div className="min-h-screen bg-white mobile-viewport">
      <div className="max-w-md mx-auto h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MoneySpend</h1>
            <p className="text-gray-600">Your Personal Finance Manager</p>
          </div>

          <div className="w-full space-y-4">
            <GoogleOneTapComponent />

            <div className="text-sm text-gray-500">
              <p>Track expenses, manage budgets, and achieve your financial goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
