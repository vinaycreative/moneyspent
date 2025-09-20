// Re-export accounts functionality from the main hooks directory
// This maintains compatibility with existing imports while keeping the hooks logic centralized
export { 
  useAccounts, 
  useAccount, 
  useAccountsWithStats,
  useCreateAccountMutation,
  useUpdateAccountMutation as useUpdateAccount,
  useDeleteAccountMutation 
} from "@/hooks/useAccounts"