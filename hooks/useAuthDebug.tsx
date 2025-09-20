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
      <div style={{ marginTop: 5 }}>
        <button onClick={actions.forceRefresh} style={{ marginRight: 5, fontSize: 10 }}>
          Refresh
        </button>
        <button onClick={actions.checkExpiry} style={{ marginRight: 5, fontSize: 10 }}>
          Check
        </button>
        <button onClick={actions.clearAuth} style={{ fontSize: 10 }}>
          Clear
        </button>
      </div>
    </div>
  )
}
