import api from "@/lib/axios"
import { ApiResponseSchema, User, UserSchema } from "@/types"

// Fetch current logged-in user (uses api instance with auth)
export const fetchLoggedInUser = async (): Promise<User> => {
  const response = await api.get("/auth/me")

  // Validate response structure
  const validatedResponse = ApiResponseSchema(UserSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch user")
  }

  return validatedResponse.data
}

// Redirect to backend login (client-side redirect)
export const initiateLogin = (): void => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
  window.location.href = `${API_BASE_URL}/auth/login`
}

// Sign out user (uses api instance, backend handles cookie clearing)
export const signOut = async (): Promise<void> => {
  try {
    await api.post("/auth/logout")
  } catch (error) {
    console.warn('Logout request failed, but continuing...', error)
  }

  // Redirect to home page after logout
  if (typeof window !== "undefined") {
    window.location.href = '/'
  }
}
