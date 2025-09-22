import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

// Simple axios instance - backend handles all auth complexity
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Simple response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not on login page, redirect to home
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith('/')) {
        console.log('Unauthorized request, redirecting to home')
        window.location.href = '/'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
