"use client"

import { AuthDebugPanel } from '@/hooks/useAuthDebug'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import api from '@/lib/axios'

export default function TestAuthPage() {
  const { user, isLoading } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

  const testApiCall = async () => {
    setTestResult('🔄 Testing API call...')
    try {
      const response = await api.get('/auth/me')
      setTestResult('✅ API call successful: ' + JSON.stringify(response.data))
    } catch (error: any) {
      setTestResult('❌ API call failed: ' + error.message)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Auth Testing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">👤 User Info</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            </div>
          </div>

          {/* API Testing */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🔗 API Testing</h2>
            <button
              onClick={testApiCall}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
              Test /auth/me API
            </button>
            <div className="text-sm bg-gray-100 p-3 rounded">
              {testResult || 'Click button to test API'}
            </div>
          </div>

          {/* Cookie Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🍪 Cookies</h2>
            <div className="text-sm bg-gray-100 p-3 rounded">
              <p><strong>access_token:</strong> {document.cookie.includes('access_token') ? 'Present' : 'Missing'}</p>
              <p><strong>refresh_token:</strong> {document.cookie.includes('refresh_token') ? 'Present' : 'Missing'}</p>
            </div>
          </div>

          {/* Manual Tests */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🧪 Manual Tests</h2>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Test 1:</strong> Leave browser tab open for 1+ hour, then click a button
                <p className="text-gray-600">Should auto-refresh token and work seamlessly</p>
              </div>
              <div>
                <strong>Test 2:</strong> In DevTools, delete access_token cookie, then click API test
                <p className="text-gray-600">Should refresh and retry automatically</p>
              </div>
              <div>
                <strong>Test 3:</strong> Delete both cookies, then refresh page
                <p className="text-gray-600">Should redirect to home page</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">📋 How to Test</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure both frontend and backend are running</li>
            <li>Login to your app normally</li>
            <li>Visit this test page: <code>/test-auth</code></li>
            <li>Use the debug panel (bottom-right) to monitor auth state</li>
            <li>Try the manual tests above</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>

      {/* Debug Panel */}
      <AuthDebugPanel />
    </div>
  )
}