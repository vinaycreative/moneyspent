import { useMemo } from "react"
import {
  useFetchAccounts,
  useFetchAccountById,
  useFetchAccountsWithStats,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/queries/accountQueries"
import type { Account, AccountWithStats, AccountType, ApiAccount } from "@/types"
import { transformApiAccount } from "@/types/schemas/account.schema"

interface UseAccountsReturn {
  accounts: Account[]
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export const useAccounts = (userId: string) => {
  const { data: accounts, isLoading, isError, error } = useFetchAccounts(userId)

  return {
    accounts,
    isLoading,
    isError,
    error,
  }
}

// Single account hook
export const useAccount = (id: string, enabled = true) => {
  const query = useFetchAccountById(id, enabled)

  return {
    ...query,
    account: query.data,
  }
}

// Accounts with stats hook
export const useAccountsWithStats = (
  userId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  const query = useFetchAccountsWithStats(userId, startDate, endDate, enabled)

  const derivedValues = useMemo(() => {
    const accountsWithStats = query.data || []
    const activeAccountsWithStats = accountsWithStats.filter((acc) => acc.is_active)

    const totalBalance = activeAccountsWithStats.reduce((sum, acc) => sum + acc.balance, 0)
    const totalTransactions = activeAccountsWithStats.reduce(
      (sum, acc) => sum + acc.transaction_count,
      0
    )

    // Most active account
    const mostActiveAccount = activeAccountsWithStats.reduce((prev, current) => {
      return prev.transaction_count > current.transaction_count ? prev : current
    }, activeAccountsWithStats[0])

    return {
      accountsWithStats,
      activeAccountsWithStats,
      totalBalance,
      totalTransactions,
      mostActiveAccount,
    }
  }, [query.data])

  return {
    ...query,
    ...derivedValues,
  }
}

// Mutation hooks for direct use
export const useCreateAccountMutation = () => useCreateAccount()
export const useUpdateAccountMutation = () => useUpdateAccount()
export const useDeleteAccountMutation = () => useDeleteAccount()
