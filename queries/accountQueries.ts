import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchAccounts,
  fetchAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  fetchAccountsWithStats,
} from "@/api/accounts"
import type {
  Account,
  AccountWithStats,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "@/types"

// Query keys for consistent cache management
export const accountQueryKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountQueryKeys.all, "list"] as const,
  list: (userId: string) => [...accountQueryKeys.lists(), userId] as const,
  details: () => [...accountQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...accountQueryKeys.details(), id] as const,
  stats: () => [...accountQueryKeys.all, "stats"] as const,
  statsForUser: (userId: string, startDate?: string, endDate?: string) =>
    [...accountQueryKeys.stats(), userId, startDate, endDate] as const,
}

// Fetch all accounts for a user
export const useFetchAccounts = (userId: string) => {
  return useQuery({
    queryKey: ["accounts", userId],
    queryFn: () => fetchAccounts(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })
}

// Fetch single account by ID
export const useFetchAccountById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: accountQueryKeys.detail(id),
    queryFn: () => fetchAccountById(id),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: "Failed to fetch account details",
    },
  })
}

// Fetch accounts with transaction statistics
export const useFetchAccountsWithStats = (
  userId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: accountQueryKeys.statsForUser(userId, startDate, endDate),
    queryFn: () => fetchAccountsWithStats(userId, startDate, endDate),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (stats change more frequently)
    meta: {
      errorMessage: "Failed to fetch account statistics",
    },
  })
}

// Create new account
export const useCreateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAccount,
    onSuccess: (newAccount) => {
      // Add to accounts list cache
      queryClient.setQueryData<Account[]>(["accounts", newAccount.user_id], (old = []) => [
        ...old,
        newAccount,
      ])

      // Invalidate accounts list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })

      // Invalidate stats as they may have changed
      queryClient.invalidateQueries({
        queryKey: ["accounts", "stats"],
      })
    },
    meta: {
      errorMessage: "Failed to create account",
    },
  })
}

// Update existing account
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      updateAccount(id, data),
    onSuccess: (updatedAccount) => {
      // Update specific account in cache
      queryClient.setQueryData(["accounts", updatedAccount.id], updatedAccount)

      // Update account in lists cache
      queryClient.setQueryData<Account[]>(
        accountQueryKeys.list(updatedAccount.user_id),
        (old = []) => old.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
      )

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
      queryClient.invalidateQueries({
        queryKey: ["accounts", "stats"],
      })
    },
    meta: {
      errorMessage: "Failed to update account",
    },
  })
}

// Delete account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: (_, deletedId) => {
      // Remove from all relevant caches
      queryClient.removeQueries({
        queryKey: ["accounts", deletedId],
      })

      // Update lists cache to remove deleted account
      queryClient.setQueriesData<Account[]>({ queryKey: ["accounts"] }, (old = []) =>
        old.filter((acc) => acc.id !== deletedId)
      )

      // Invalidate stats as they may have changed
      queryClient.invalidateQueries({
        queryKey: ["accounts", "stats"],
      })

      // Also invalidate transactions as they might reference this account
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      })
    },
    meta: {
      errorMessage: "Failed to delete account",
    },
  })
}
