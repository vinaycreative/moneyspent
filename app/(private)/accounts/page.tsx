"use client"

import { useState } from "react"
import {
  Building2,
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Wallet,
  PiggyBank,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAccounts, useDeleteAccount } from "@/lib/hooks"
import { AddAccountModal } from "@/components/AddAccountModal"
import { EditAccountModal } from "@/components/EditAccountModal"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

export default function AccountsPage() {
  const { user, isLoading } = useAuth()
  const [showBalances, setShowBalances] = useState(true)
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Get user's accounts
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts(user?.id || "", {
    enabled: !!user?.id,
  })

  const deleteAccount = useDeleteAccount()

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0)

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return Building2
      case "credit_card":
        return CreditCard
      case "cash":
        return Wallet
      case "savings":
        return PiggyBank
      default:
        return Building2
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case "bank":
        return "bg-blue-500"
      case "credit_card":
        return "bg-purple-500"
      case "cash":
        return "bg-green-500"
      case "savings":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDeleteClick = (accountId: string) => {
    setDeleteAccountId(accountId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteAccountId) return

    try {
      await deleteAccount.mutateAsync(deleteAccountId)
      setShowDeleteConfirm(false)
      setDeleteAccountId(null)
    } catch (error) {
      console.error("Failed to delete account:", error)
    }
  }

  const accountToDelete = accounts.find((account) => account.id === deleteAccountId)

  return (
    <div className="max-w-md mx-auto h-full">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-black">My Accounts</h1>
          <AddAccountModal>
            <button className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors">
              <Plus className="w-5 h-5 text-purple-600" />
            </button>
          </AddAccountModal>
        </div>
      </div>

      {/* Total Balance */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total Balance</span>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-3xl font-bold">
            {showBalances ? `₹ ${totalBalance.toLocaleString()}` : "₹ ****"}
          </div>
          <div className="text-sm opacity-90 mt-1">{accounts.length} accounts</div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-black mb-4">All Accounts</h2>

        {accountsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type)
              const color = getAccountColor(account.type)

              return (
                <div
                  key={account.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-black">{account.name}</div>
                    {account.account_number && (
                      <div className="text-sm text-gray-500">{account.account_number}</div>
                    )}
                    <div className="text-xs text-gray-400 capitalize">
                      {account.type.replace("_", " ")}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold text-lg ${
                        account.balance >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {showBalances ? `₹ ${account.balance.toLocaleString()}` : "₹ ****"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.balance >= 0 ? "Available" : "Due"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <EditAccountModal account={account}>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </EditAccountModal>
                    <button
                      onClick={() => handleDeleteClick(account.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">No accounts yet</div>
            <div className="text-sm">Add your first account to get started</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6 pb-6">
        <h2 className="text-lg font-bold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <AddAccountModal>
            <button className="p-4 rounded-xl border border-gray-200 text-center hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-medium text-black">Add Card</div>
            </button>
          </AddAccountModal>
          <AddAccountModal>
            <button className="p-4 rounded-xl border border-gray-200 text-center hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🏦</div>
              <div className="text-sm font-medium text-black">Add Account</div>
            </button>
          </AddAccountModal>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md w-full mx-4 p-0 bg-white rounded-xl border-0 shadow-2xl">
          <DialogTitle className="sr-only">Delete Account Confirmation</DialogTitle>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600">
                Are you sure you want to delete "{accountToDelete?.name}"? This action cannot be
                undone.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteAccount.isPending}
                className="w-full bg-red-500 text-white rounded-lg py-3 font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
