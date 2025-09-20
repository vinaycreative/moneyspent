"use client"
import { useState } from "react"
import type { ApiAccount } from "@/types/schemas/account.schema"
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
import { useAuth, useAccounts, useDeleteAccountMutation } from "@/hooks"
import { DeleteConfirmationSheet } from "@/components/DeleteConfirmationSheet"
import { AddAccount } from "@/form/AddAccount"
import { EditAccount } from "@/form/EditAccount"

export default function AccountsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [showBalances, setShowBalances] = useState(true)
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Edit account state
  const [selectedAccount, setSelectedAccount] = useState<ApiAccount | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleCloseEdit = () => {
    setSelectedAccount(null)
    setIsEditOpen(false)
  }

  const handleOpenEdit = (account: ApiAccount) => {
    setSelectedAccount(account)
    setIsEditOpen(true)
  }

  // Get user's accounts using new architecture
  const { accounts, isLoading: accountsLoading, isError: accountsError } = useAccounts(user?.id || '')

  // Calculate derived values in the component
  const activeAccounts = accounts?.filter((acc: ApiAccount) => !acc.is_archived)
  const hasAccounts = (accounts?.length || 0) > 0
  const totalBalance = activeAccounts?.reduce((sum: number, acc: ApiAccount) => sum + acc.current_balance, 0)
  const accountCount = accounts?.length || 0

  const deleteAccountMutation = useDeleteAccountMutation()

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

  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  // Handle accounts error state
  if (accountsError) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load accounts</p>
          <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return Building2
      case "credit":
        return CreditCard
      case "cash":
        return Wallet
      case "wallet":
        return Wallet
      case "savings":
        return PiggyBank
      case "investment":
        return PiggyBank
      default:
        return Building2
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case "bank":
        return "bg-blue-500"
      case "credit":
        return "bg-purple-500"
      case "cash":
        return "bg-green-500"
      case "wallet":
        return "bg-green-600"
      case "savings":
        return "bg-orange-500"
      case "investment":
        return "bg-indigo-500"
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
      await deleteAccountMutation.mutateAsync(deleteAccountId)
      setShowDeleteConfirm(false)
      setDeleteAccountId(null)
    } catch (error) {
      console.error("Failed to delete account:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4">
      {/* Header */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Accounts</h1>
          <AddAccount
            trigger={
              <button className="p-2 rounded-sm cursor-pointer bg-purple-100 hover:bg-purple-200 transition-colors">
                <Plus className="w-5 h-5 text-purple-600" />
              </button>
            }
          />
        </div>
      </div>

      {/* Total Balance */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-md p-6 text-white">
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
            {accountsLoading ? (
              <div className="animate-pulse bg-white/20 h-9 w-32 rounded"></div>
            ) : showBalances ? (
              `₹ ${totalBalance?.toLocaleString()}`
            ) : (
              "₹ ****"
            )}
          </div>
          <div className="text-sm opacity-90 mt-1">
            {accountsLoading ? (
              <div className="animate-pulse bg-white/20 h-4 w-20 rounded"></div>
            ) : (
              `${accountCount} accounts`
            )}
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Accounts</h2>

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
        ) : hasAccounts ? (
          <div className="space-y-4">
            {accounts?.map((account: ApiAccount) => {
              const Icon = getAccountIcon(account.type)
              const color = getAccountColor(account.type)

              return (
                <div
                  key={account.id}
                  className="flex items-center gap-4 p-4 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-black">{account.name}</div>
                    {/* account.account_number && (
                      <div className="text-sm text-gray-500">{account.account_number}</div>
                    ) */}
                    <div className="text-xs text-gray-400 capitalize">
                      {account.type.replace("_", " ")}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold text-lg ${
                        account.current_balance >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {showBalances ? `₹ ${account.current_balance}` : "₹ ****"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.current_balance >= 0 ? "Available" : "Due"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => handleOpenEdit(account)}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
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
      <div className="px-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <AddAccount
            trigger={
              <button className="p-4 cursor-pointer rounded-md border border-gray-200 text-center hover:bg-gray-50 transition-colors">
                <div className="text-2xl mb-2">🏦</div>
                <div className="text-sm font-medium text-black">Add Account</div>
              </button>
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Sheet */}
      <DeleteConfirmationSheet
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Account"
        description="Are you sure you want to delete"
        itemName={accounts?.find((acc: ApiAccount) => acc.id === deleteAccountId)?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isPending={deleteAccountMutation.isPending}
        confirmText="Delete Account"
        additionalDetails={
          deleteAccountId &&
          (() => {
            const accountToDelete = accounts?.find((acc: ApiAccount) => acc.id === deleteAccountId)
            return (
              accountToDelete && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {accountToDelete.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span
                      className={`font-medium ${
                        accountToDelete.current_balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹ {accountToDelete.current_balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        accountToDelete.current_balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {accountToDelete.current_balance >= 0 ? "Available" : "Due"}
                    </span>
                  </div>
                </div>
              )
            )
          })()
        }
      />

      {/* Edit Account Form */}
      {selectedAccount && (
        <EditAccount
          trigger={<div style={{ display: "none" }}></div>}
          account={selectedAccount}
          onClose={handleCloseEdit}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  )
}
