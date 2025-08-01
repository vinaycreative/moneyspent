"use client"

import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an issue with the authentication process
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <p className="font-medium">Authentication Failed</p>
            <p className="mt-1">
              The authentication process could not be completed. This might be due to:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Invalid or expired authentication code</li>
              <li>Network connectivity issues</li>
              <li>Configuration problems with OAuth settings</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Link>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                If the problem persists, please check your internet connection and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 