import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { authManager } from "@/lib/auth-manager"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Track requests being retried to prevent infinite loops
const retryingRequests = new Set<string>()

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Request interceptor to add auth token and ensure session validity
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth validation for auth endpoints to prevent recursion
    const isAuthEndpoint = config.url?.includes('/auth/')
    
    if (!isAuthEndpoint) {
      try {
        // Ensure we have a valid session before making the request
        const hasValidSession = await authManager.ensureValidSession()
        
        if (!hasValidSession) {
          // If we can't get a valid session, clear auth and reject
          await authManager.clearAuthData()
          return Promise.reject(new Error('Authentication session invalid'))
        }
      } catch (error) {
        console.warn('Failed to validate session for request:', error)
        // Continue with request - let response interceptor handle auth errors
      }
    }
    
    // Always try to get the latest token
    const token = authManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with smart retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 errors with smart retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
      // Create unique request identifier to prevent duplicate retries
      const requestId = `${originalRequest.method}-${originalRequest.url}-${Date.now()}`
      
      // Check if this request is already being retried
      if (retryingRequests.has(requestId)) {
        console.warn('Request already being retried, skipping:', requestId)
        return Promise.reject(error)
      }
      
      try {
        // Mark request as being retried
        retryingRequests.add(requestId)
        originalRequest._isRetry = true
        
        console.log('Handling 401 error, attempting token refresh...')
        
        // Try to handle the auth error (refresh token)
        const authRecovered = await authManager.handleAuthError()
        
        if (authRecovered) {
          console.log('Auth recovered, retrying original request')
          
          // Get the new token and retry the request
          const newToken = authManager.getAccessToken()
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          
          // Retry the original request
          return api(originalRequest)
        } else {
          console.log('Auth recovery failed, redirecting to login')
          
          // Auth recovery failed, redirect to login
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            // Small delay to prevent race conditions
            setTimeout(() => {
              window.location.href = '/'
            }, 100)
          }
          
          return Promise.reject(new Error('Authentication failed and could not be recovered'))
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        
        // Clear auth data and redirect on refresh failure
        await authManager.clearAuthData()
        
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
        }
        
        return Promise.reject(error)
      } finally {
        // Clean up retry tracking
        retryingRequests.delete(requestId)
      }
    }
    
    // Handle other errors normally
    return Promise.reject(error)
  }
)

export default api
