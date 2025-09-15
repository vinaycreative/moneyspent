import { useFetchLoggedInUser } from "@/queries/authQueries"

export const useAuth = () => {
  const { data: user, isLoading: isLoadingLoggedInUser } = useFetchLoggedInUser()
  return { user, isLoading: isLoadingLoggedInUser }
}
