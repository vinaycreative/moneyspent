/**
 * Centralized Authentication Manager
 * 
 * Handles JWT token refresh, session management, and prevents infinite loops
 * This manager acts as a singleton to coordinate auth state across the app
 */

import { supabase } from "@/lib/supabase/client"

interface AuthState {
  isRefreshing: boolean
  refreshPromise: Promise<boolean> | null
  failureCount: number
  lastRefreshAttempt: number
  circuitBreakerOpen: boolean
}

class AuthManager {
  private state: AuthState = {
    isRefreshing: false,
    refreshPromise: null,
    failureCount: 0,
    lastRefreshAttempt: 0,
    circuitBreakerOpen: false
  }

  // Circuit breaker constants
  private readonly MAX_FAILURES = 3
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000 // 1 minute
  private readonly REFRESH_COOLDOWN = 5000 // 5 seconds between refresh attempts

  /**
   * Get current access token from cookie
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const allCookies = document.cookie
    console.log('All cookies:', allCookies) // Debug log
    
    const token = allCookies
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1]
    
    console.log('Found access_token:', token ? 'present' : 'missing') // Debug log
    return token || null
  }

  /**
   * Set access token in cookie
   */
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    
    // Set secure, httpOnly-like cookie (as much as possible from client-side)
    const expiryDate = new Date()
    expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000)) // 24 hours
    
    // Use production-compatible cookie settings
    const isProduction = process.env.NODE_ENV === 'production'
    const sameSite = isProduction ? 'none' : 'lax'
    const secure = isProduction ? '; secure' : ''
    
    document.cookie = `access_token=${token}; expires=${expiryDate.toUTCString()}; path=/; samesite=${sameSite}${secure}`
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    // Clear circuit breaker state
    this.state = {
      isRefreshing: false,
      refreshPromise: null,
      failureCount: 0,
      lastRefreshAttempt: 0,
      circuitBreakerOpen: false
    }

    if (typeof window !== 'undefined') {
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()
    }

    // Clear Supabase session
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // Silent failure for cleanup
      console.warn('Failed to clear Supabase session:', error)
    }
  }

  /**
   * Check if circuit breaker should prevent refresh attempts
   */
  private shouldPreventRefresh(): boolean {
    const now = Date.now()
    
    // Check if circuit breaker is open
    if (this.state.circuitBreakerOpen) {
      if (now - this.state.lastRefreshAttempt > this.CIRCUIT_BREAKER_TIMEOUT) {
        // Reset circuit breaker after timeout
        this.state.circuitBreakerOpen = false
        this.state.failureCount = 0
      } else {
        return true // Circuit breaker still open
      }
    }

    // Check cooldown period
    if (now - this.state.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
      return true
    }

    return false
  }

  /**
   * Refresh authentication token with circuit breaker protection
   */
  async refreshToken(): Promise<boolean> {
    // Check circuit breaker
    if (this.shouldPreventRefresh()) {
      console.warn('Auth refresh blocked by circuit breaker')
      return false
    }

    // If already refreshing, wait for existing promise
    if (this.state.isRefreshing && this.state.refreshPromise) {
      return await this.state.refreshPromise
    }

    // Start refresh process
    this.state.isRefreshing = true
    this.state.lastRefreshAttempt = Date.now()

    this.state.refreshPromise = this.performTokenRefresh()

    const result = await this.state.refreshPromise

    // Clean up state
    this.state.isRefreshing = false
    this.state.refreshPromise = null

    return result
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      console.log('Attempting to refresh authentication token...')
      
      // First try Supabase session refresh
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error || !data.session) {
        throw new Error(`Supabase refresh failed: ${error?.message}`)
      }

      // Extract new token
      const newToken = data.session.access_token
      
      if (!newToken) {
        throw new Error('No access token in refreshed session')
      }

      // Update cookie
      this.setAccessToken(newToken)
      
      // Reset failure count on success
      this.state.failureCount = 0
      this.state.circuitBreakerOpen = false
      
      console.log('Token refresh successful')
      return true

    } catch (error) {
      console.error('Token refresh failed:', error)
      
      // Increment failure count
      this.state.failureCount++
      
      // Open circuit breaker if too many failures
      if (this.state.failureCount >= this.MAX_FAILURES) {
        this.state.circuitBreakerOpen = true
        console.warn(`Circuit breaker opened after ${this.MAX_FAILURES} failures`)
      }
      
      return false
    }
  }

  /**
   * Check if token is expired or close to expiry
   */
  async isTokenExpiredOrExpiring(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return true
      
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      
      // Consider token expired if it expires within next 5 minutes
      const bufferTime = 5 * 60 // 5 minutes
      
      return expiresAt <= (now + bufferTime)
    } catch (error) {
      console.error('Failed to check token expiry:', error)
      return true // Assume expired on error
    }
  }

  /**
   * Validate current session and refresh if needed
   */
  async ensureValidSession(): Promise<boolean> {
    try {
      // Check if token is expired or expiring soon
      const needsRefresh = await this.isTokenExpiredOrExpiring()
      
      if (needsRefresh) {
        console.log('Token needs refresh')
        return await this.refreshToken()
      }
      
      // Token is still valid
      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  /**
   * Handle authentication errors (typically from HTTP interceptors)
   */
  async handleAuthError(): Promise<boolean> {
    console.log('Handling authentication error...')
    
    // Try to refresh token first
    const refreshSuccess = await this.refreshToken()
    
    if (!refreshSuccess) {
      // Refresh failed, clear auth data and return false
      await this.clearAuthData()
      return false
    }
    
    return true
  }

  /**
   * Get current auth state for debugging
   */
  getDebugState() {
    return {
      ...this.state,
      hasToken: !!this.getAccessToken(),
      currentTime: Date.now()
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager()