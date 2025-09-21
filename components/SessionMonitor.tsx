"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { authManager } from "@/lib/auth-manager"
import { useAuth } from "@/hooks/useAuth"

/**
 * Background Session Monitor
 * 
 * This component runs in the background and proactively monitors
 * and refreshes authentication tokens before they expire.
 * 
 * It should be included in the root layout to monitor all pages.
 */
export default function SessionMonitor() {
  const pathname = usePathname()
  
  // Only monitor auth on private routes
  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/settings")
  
  // Only call auth API on private routes to avoid unnecessary /auth/me calls
  const { isAuthenticated } = useAuth({ enabled: isPrivateRoute })
  const shouldMonitor = isPrivateRoute && isAuthenticated

  const checkAndRefreshSession = useCallback(async () => {
    if (!shouldMonitor) return

    try {
      // Check if token needs refresh (within 5 minutes of expiry)
      const needsRefresh = await authManager.isTokenExpiredOrExpiring()
      
      if (needsRefresh) {
        console.log('SessionMonitor: Token needs refresh, refreshing proactively')
        const success = await authManager.refreshToken()
        
        if (success) {
          console.log('SessionMonitor: Proactive token refresh successful')
        } else {
          console.warn('SessionMonitor: Proactive token refresh failed')
        }
      }
    } catch (error) {
      console.error('SessionMonitor: Error during session check:', error)
    }
  }, [shouldMonitor])

  // Set up periodic session monitoring
  useEffect(() => {
    if (!shouldMonitor) return

    // Check immediately
    checkAndRefreshSession()

    // Set up interval to check every 2 minutes
    const intervalId = setInterval(checkAndRefreshSession, 2 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [shouldMonitor, checkAndRefreshSession])

  // Also check on window focus (when user returns to the tab)
  useEffect(() => {
    if (!shouldMonitor) return

    const handleFocus = () => {
      console.log('SessionMonitor: Window focused, checking session')
      checkAndRefreshSession()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [shouldMonitor, checkAndRefreshSession])

  // Monitor for the refresh header from middleware
  useEffect(() => {
    if (!shouldMonitor) return

    const handleResponse = (event: Event) => {
      const response = (event as any).detail
      const refreshNeeded = response?.headers?.get('X-Token-Refresh-Needed')
      
      if (refreshNeeded === 'true') {
        console.log('SessionMonitor: Middleware indicates token refresh needed')
        checkAndRefreshSession()
      }
    }

    // This is a custom event that would be dispatched by axios interceptors
    window.addEventListener('http-response', handleResponse)
    return () => window.removeEventListener('http-response', handleResponse)
  }, [shouldMonitor, checkAndRefreshSession])

  // This component renders nothing - it's just for side effects
  return null
}