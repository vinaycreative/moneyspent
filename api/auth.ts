import { z } from "zod"
import api from "@/lib/axios"
import { ApiResponseSchema, User, UserSchema } from "@/types"

// Fetch current logged-in user
export const fetchLoggedInUser = async (): Promise<User> => {
  const response = await api.get("/auth/me")

  // Validate response structure
  const validatedResponse = ApiResponseSchema(UserSchema).parse(response.data)

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch user")
  }

  return validatedResponse.data
}

// Sign out user
export const signOut = async (): Promise<void> => {
  await api.post("/auth/logout")

  // Clear local auth state
  if (typeof window !== "undefined") {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.clear()
    sessionStorage.clear()
  }
}

// Refresh auth token
export const refreshToken = async (): Promise<{ access_token: string }> => {
  const response = await api.post("/auth/refresh")

  const validatedResponse = ApiResponseSchema(z.object({ access_token: z.string() })).parse(
    response.data
  )

  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to refresh token")
  }

  return validatedResponse.data
}
