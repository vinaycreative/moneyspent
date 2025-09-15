import { useQuery } from "@tanstack/react-query"
import { fetchLoggedInUser } from "@/api/auth"

export const useFetchLoggedInUser = () => {
  return useQuery({
    queryKey: ["loggedInUser"],
    queryFn: fetchLoggedInUser,
  })
}
