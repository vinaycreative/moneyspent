import { useState, useEffect } from "react"
import { authManager } from "@/lib/auth-manager"

/**
 * Debug hook for monitoring authentication state
 * Use this during development to debug auth issues
 */
export const useAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo({
        ...authManager.getDebugState(),
        timestamp: new Date().toLocaleTimeString(),
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const forceRefresh = async () => {
    console.log("🔄 Force refresh triggered")
    const result = await authManager.refreshToken()
    console.log("🔄 Force refresh result:", result)
    return result
  }

  const testBackendEndpoint = async () => {
    console.log("🧪 Testing backend refresh endpoint")
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log("🧪 Backend response:", response.status, response.statusText)
      return response.ok
    } catch (error) {
      console.error("🧪 Backend test failed:", error)
      return false
    }
  }

  const testAuthMeEndpoint = async () => {
    console.log("🧪 Testing /auth/me endpoint")
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log("🧪 /auth/me response:", response.status, response.statusText)
      if (!response.ok) {
        const text = await response.text()
        console.log("🧪 Response body:", text)
      }
      return response.ok
    } catch (error) {
      console.error("🧪 /auth/me test failed:", error)
      return false
    }
  }

  const debugTokens = () => {
    const cookies = document.cookie.split(';')
    const accessToken = cookies.find(c => c.trim().startsWith('access_token='))?.split('=')[1]
    const refreshToken = cookies.find(c => c.trim().startsWith('refresh_token='))?.split('=')[1]
    
    console.log('🍪 Cookie Debug:')
    console.log('access_token exists:', !!accessToken)
    console.log('refresh_token exists:', !!refreshToken)
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const expiresAt = new Date(payload.exp * 1000)
        const now = new Date()
        console.log('Token expires at:', expiresAt.toISOString())
        console.log('Current time:', now.toISOString())
        console.log('Minutes until expiry:', Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60))
      } catch (e) {
        console.log('Failed to decode access token:', e)
      }
    }
  }

  const clearAuth = async () => {
    console.log("🗑️ Clear auth triggered")
    await authManager.clearAuthData()
    console.log("🗑️ Auth data cleared")
  }

  const checkExpiry = async () => {
    console.log("⏰ Checking token expiry")
    const isExpiring = await authManager.isTokenExpiredOrExpiring()
    console.log("⏰ Token expiring:", isExpiring)
    return isExpiring
  }

  return {
    debugInfo,
    actions: {
      forceRefresh,
      clearAuth,
      checkExpiry,
      testBackendEndpoint,
      testAuthMeEndpoint,
      debugTokens,
    },
  }
}

/**
 * Debug component for displaying auth state (development only)
 */
export const AuthDebugPanel = () => {
  const { debugInfo, actions } = useAuthDebug()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: 10,
        borderRadius: 5,
        fontSize: 10,
        fontFamily: "monospace",
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <div>
        <strong>Auth Debug</strong>
      </div>
      <div>Time: {debugInfo?.timestamp}</div>
      <div>Has Token: {debugInfo?.hasToken ? "✅" : "❌"}</div>
      <div>Refreshing: {debugInfo?.isRefreshing ? "🔄" : "💤"}</div>
      <div>Failures: {debugInfo?.failureCount || 0}</div>
      <div>Circuit: {debugInfo?.circuitBreakerOpen ? "🔴" : "🟢"}</div>
      <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <button onClick={actions.forceRefresh} style={{ fontSize: 10 }}>
          Refresh
        </button>
        <button onClick={actions.checkExpiry} style={{ fontSize: 10 }}>
          Check
        </button>
        <button onClick={actions.testBackendEndpoint} style={{ fontSize: 10 }}>
          Test BE
        </button>
        <button onClick={actions.testAuthMeEndpoint} style={{ fontSize: 10 }}>
          Test /me
        </button>
        <button onClick={actions.debugTokens} style={{ fontSize: 10 }}>
          Debug
        </button>
        <button onClick={actions.clearAuth} style={{ fontSize: 10 }}>
          Clear
        </button>
      </div>
    </div>
  )
}
