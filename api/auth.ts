import api from "@/lib/api"

export const fetchLoggedInUser = async () => {
  const response = await api.get("/auth/me")
  return response.data.data
}
