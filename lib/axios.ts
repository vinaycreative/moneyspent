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

// Smart response interceptor - backend handles refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If 401, check if user should be logged out
    if (error.response?.status === 401) {
      console.log('❌ Got 401 response')
      
      // Check if user still has tokens after backend processing
      if (authManager.hasToken()) {
        console.log('⚠️ User has token but got 401 - backend should have handled refresh')
        // Backend middleware should have handled refresh automatically
        // If we still get 401, it means refresh failed on backend
        // Let's retry once in case there was a race condition
        if (!originalRequest._retry) {
          originalRequest._retry = true
          console.log('🔄 Retrying request once...')
          return api(originalRequest)
        }
      } else {
        // No token at all, user is not logged in
        console.log('❌ No token found, redirecting to home')
        if (typeof window !== "undefined" && !window.location.pathname.startsWith('/')) {
          window.location.href = '/'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
