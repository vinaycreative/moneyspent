"use client"

import { useState } from "react"
import { authManager } from "@/lib/auth-manager"
import { useAuth } from "@/hooks/useAuth"
import { AuthDebugPanel } from "@/hooks/useAuthDebug"

/**
 * Test page for debugging authentication issues
 * Visit /auth-test to debug token refresh issues
 * Remove this file in production
 */
export default function AuthTestPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testTokenRefresh = async () => {
    addResult("🧪 Starting token refresh test...")
    try {
      const result = await authManager.refreshToken()
      addResult(`✅ Token refresh result: ${result}`)
    } catch (error) {
      addResult(`❌ Token refresh failed: ${error}`)
    }
  }

  const testTokenExpiry = async () => {
    addResult("🧪 Checking token expiry...")
    try {
      const isExpiring = await authManager.isTokenExpiredOrExpiring()
      addResult(`⏰ Token expiring: ${isExpiring}`)
    } catch (error) {
      addResult(`❌ Token expiry check failed: ${error}`)
    }
  }

  const testSessionValidation = async () => {
    addResult("🧪 Testing session validation...")
    try {
      const isValid = await authManager.ensureValidSession()
      addResult(`🔐 Session valid: ${isValid}`)
    } catch (error) {
      addResult(`❌ Session validation failed: ${error}`)
    }
  }

  const clearAuth = async () => {
    addResult("🗑️ Clearing auth data...")
    await authManager.clearAuthData()
    addResult("🗑️ Auth data cleared")
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
          <div className="space-y-1 text-sm">
            <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
            <p>User: {user?.name || 'Not logged in'}</p>
            <p>Loading: {isLoading ? '🔄' : '✅'}</p>
            <p>Token: {authManager.getAccessToken() ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">Test Functions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testTokenRefresh}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Test Refresh
            </button>
            <button
              onClick={testTokenExpiry}
              className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Check Expiry
            </button>
            <button
              onClick={testSessionValidation}
              className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Validate Session
            </button>
            <button
              onClick={clearAuth}
              className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear Auth
            </button>
            <button
              onClick={clearResults}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Test Results</h2>
          <div className="space-y-1 text-xs font-mono bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click the test buttons above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="border-b border-gray-200 pb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Debug panel */}
      <AuthDebugPanel />
    </div>
  )
}