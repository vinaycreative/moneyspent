import axios from "axios"
import { authManager } from "@/lib/auth-manager"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

// Axios instance with smart auth handling
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Smart response interceptor with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Check if user has any token (even expired)
      if (authManager.hasToken()) {
        console.log('🔄 Got 401, attempting token refresh...')
        
        try {
          const refreshSuccess = await authManager.refreshToken()
          
          if (refreshSuccess) {
            console.log('✅ Token refreshed, retrying original request')
            // Retry the original request
            return api(originalRequest)
          } else {
            console.log('❌ Token refresh failed')
            // authManager.refreshToken() already handled logout if needed
            return Promise.reject(error)
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError)
          return Promise.reject(error)
        }
      } else {
        // No token at all, user is not logged in
        console.log('❌ No token found, user not logged in')
        if (typeof window !== "undefined" && !window.location.pathname.startsWith('/')) {
          window.location.href = '/'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
