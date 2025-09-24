/**
 * Auth Manager - Handles token refresh and session management
 * 
 * Core Logic:
 * - If user has ANY token (expired or active) = User is logged in
 * - If user has NO token = User is logged out
 * - Silent token refresh when needed
 * - Never redirect to /auth/login from frontend
 */

interface DebugState {
  hasToken: boolean
  isRefreshing: boolean
  failureCount: number
  circuitBreakerOpen: boolean
  lastRefresh?: Date
}

class AuthManager {
  private isRefreshing = false
  private failureCount = 0
  private circuitBreakerOpen = false
  private readonly MAX_FAILURES = 3
  private readonly CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  private lastCircuitBreakerOpen = 0
  private refreshPromise: Promise<boolean> | null = null
  private lastRefresh?: Date

  /**
   * Get current access token from cookie
   */
  private getAccessToken(): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    )
    
    if (!tokenCookie) return null
    
    return tokenCookie.split('=')[1]?.trim() || null
  }

  /**
   * Check if user has any token (regardless of expiry)
   * This determines if user is "logged in" or not
   */
  hasToken(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * Refresh the access token silently
   */
  async refreshToken(): Promise<boolean> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      const now = Date.now()
      if (now - this.lastCircuitBreakerOpen < this.CIRCUIT_BREAKER_TIMEOUT) {
        console.log('🔴 Auth circuit breaker is open, skipping refresh')
        return false
      }
      // Reset circuit breaker
      this.circuitBreakerOpen = false
      this.failureCount = 0
      console.log('🟢 Auth circuit breaker reset')
    }

    // Create refresh promise
    this.refreshPromise = this._performRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null
    
    return result
  }

  /**
   * Internal method to perform the actual refresh
   */
  private async _performRefresh(): Promise<boolean> {
    this.isRefreshing = true
    
    try {
      console.log('🔄 Attempting silent token refresh...')
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Important: includes cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        this.failureCount = 0
        this.lastRefresh = new Date()
        console.log('✅ Token refresh successful')
        return true
      } else if (response.status === 401 || response.status === 403) {
        // Refresh token is also invalid/expired
        console.log('❌ Refresh token invalid, user needs to login')
        await this.clearAuthData()
        return false
      } else {
        throw new Error(`Refresh failed: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      this.failureCount++
      
      if (this.failureCount >= this.MAX_FAILURES) {
        this.circuitBreakerOpen = true
        this.lastCircuitBreakerOpen = Date.now()
        console.log('🔴 Auth circuit breaker opened due to repeated failures')
        
        // If we've failed too many times, clear auth data
        await this.clearAuthData()
      }
      
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Ensure we have a valid session
   * This is the main method used by AuthGuard and other components
   */
  async ensureValidSession(): Promise<boolean> {
    // If no token exists, user is not logged in
    if (!this.hasToken()) {
      console.log('❌ No access token found - user not logged in')
      return false
    }

    console.log('✅ User has token - checking expiry...')
    
    // Check if token is expired or expiring soon
    const isExpiring = await this.isTokenExpiredOrExpiring()
    
    if (isExpiring) {
      console.log('⚠️ Token is expired/expiring, attempting refresh...')
      const refreshSuccess = await this.refreshToken()
      
      if (refreshSuccess) {
        console.log('✅ Token refreshed successfully')
        return true
      } else {
        console.log('❌ Token refresh failed - user needs to login')
        return false
      }
    }
    
    console.log('✅ Token is still valid - user is logged in')
    return true
  }

  /**
   * Clear all authentication data and redirect to home
   */
  async clearAuthData(): Promise<void> {
    console.log('🗑️ Clearing auth data and logging out user')
    
    // Clear the access_token cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    }

    // Reset internal state
    this.isRefreshing = false
    this.failureCount = 0
    this.circuitBreakerOpen = false
    this.lastRefresh = undefined
    this.refreshPromise = null

    // Redirect to home page (public route)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  /**
   * Check if token is expired or expiring soon
   */
  async isTokenExpiredOrExpiring(): Promise<boolean> {
    const token = this.getAccessToken()
    if (!token) return true
    
    try {
      // Decode JWT token properly
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = new Date(payload.exp * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()
      const FIVE_MINUTES = 5 * 60 * 1000
      
      console.log(`🕐 Token expires: ${expiresAt.toISOString()}`)
      console.log(`🕐 Current time: ${now.toISOString()}`)
      console.log(`🕐 Time until expiry: ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`)
      
      const isExpiring = timeUntilExpiry <= FIVE_MINUTES
      console.log(`🕐 Token is ${isExpiring ? 'expiring soon' : 'still valid'}`)
      
      return isExpiring
    } catch (error) {
      console.error('❌ Failed to decode token:', error)
      return true
    }
  }

  /**
   * Get debug information for development
   */
  getDebugState(): DebugState {
    return {
      hasToken: this.hasToken(),
      isRefreshing: this.isRefreshing,
      failureCount: this.failureCount,
      circuitBreakerOpen: this.circuitBreakerOpen,
      lastRefresh: this.lastRefresh
    }
  }

  /**
   * Manually trigger a refresh (for debugging)
   */
  async forceRefresh(): Promise<boolean> {
    // Clear any existing refresh promise to force a new one
    this.refreshPromise = null
    return await this.refreshToken()
  }
}

// Export a singleton instance
export const authManager = new AuthManager()