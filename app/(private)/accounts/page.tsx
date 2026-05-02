"use client"
import { useState } from "react"
import type { ApiAccount } from "@/types/schemas/account.schema"
import {
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  EyeOff,
  Eye,
  MoreVertical,
  Trash2,
  Plus,
  SlidersHorizontal,
} from "lucide-react"
import { useAuth, useAccounts, useDeleteAccountMutation } from "@/hooks"
import { DeleteConfirmationSheet } from "@/components/DeleteConfirmationSheet"
import { AddAccount } from "@/form/AddAccount"
import { EditAccount } from "@/form/EditAccount"
import moment from "moment"
import Page from "@/components/layout/Page"

export default function AccountsPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [showBalances, setShowBalances] = useState(true)
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const {
    accounts,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccounts(user?.id || "")

  const activeAccounts = accounts?.filter((acc: ApiAccount) => !acc.is_archived)
  const totalBalance =
    activeAccounts?.reduce((sum: number, acc: ApiAccount) => sum + acc.current_balance, 0) ?? 0
  const accountCount = activeAccounts?.length ?? 0

  const deleteAccountMutation = useDeleteAccountMutation()

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

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "bank":
        return "Bank"
      case "credit":
        return "Credit Card"
      case "cash":
        return "Cash"
      case "wallet":
        return "Wallet"
      case "savings":
        return "Savings"
      case "investment":
        return "Investment"
      default:
        return type
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-accent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  if (accountsError) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <p className="text-sm text-neg font-medium">Failed to load accounts</p>
      </div>
    )
  }

  return (
    <Page>
      {/* Header */}
      <header className="pb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-ms-muted font-medium mb-0.5">{moment().format("MMMM D")}</p>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Account</h1>
        </div>
        <AddAccount
          trigger={
            <button className="mt-1 w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:scale-95 transition-transform">
              <SlidersHorizontal size={16} />
            </button>
          }
        />
      </header>

      <div className="flex flex-col gap-6">
        {/* Total Balance Card */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted">
              Total Balance
            </p>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="text-ms-muted active:scale-95 transition-transform"
            >
              {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {accountsLoading ? (
            <div className="h-10 w-36 rounded-xl bg-surface-alt animate-pulse mb-2" />
          ) : (
            <p className="text-4xl font-black text-ink tracking-tight mb-2">
              {showBalances ? `₹${totalBalance.toLocaleString("en-IN")}` : "₹ ••••••"}
            </p>
          )}

          <p className="text-xs text-ms-muted font-medium">
            {accountsLoading ? (
              <span className="inline-block h-3 w-16 rounded bg-surface-alt animate-pulse" />
            ) : (
              `${accountCount} Account${accountCount !== 1 ? "s" : ""}`
            )}
          </p>
        </div>

        {/* All Accounts */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-bold text-ink">All accounts</h2>
            <p className="text-[11px] text-ms-muted font-medium">{accountCount} Accounts</p>
          </div>

          {accountsLoading ? (
            <div className="bg-surface border border-line rounded-2xl overflow-hidden">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-4 border-b border-line last:border-0 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-2xl bg-surface-alt shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-surface-alt" />
                    <div className="h-3 w-14 rounded bg-surface-alt" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-4 w-20 rounded bg-surface-alt" />
                    <div className="h-3 w-14 rounded bg-surface-alt" />
                  </div>
                </div>
              ))}
            </div>
          ) : (activeAccounts?.length ?? 0) > 0 ? (
            <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
              {activeAccounts?.map((account: ApiAccount, idx: number) => {
                const Icon = getAccountIcon(account.type)
                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-3 px-4 py-4 transition-colors active:bg-surface-alt ${
                      idx < (activeAccounts?.length ?? 0) - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-surface-alt flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-ink" />
                    </div>

                    {/* Name + type */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink leading-tight">
                        {account.name}
                      </p>
                      <p className="text-[11px] text-ms-muted font-medium mt-0.5">
                        {getAccountTypeLabel(account.type)}
                      </p>
                    </div>

                    {/* Balance */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-ink">
                        {showBalances
                          ? `₹${account.current_balance.toLocaleString("en-IN")}`
                          : "₹ ••••"}
                      </p>
                      <p className="text-[10px] text-ms-muted font-medium mt-0.5">
                        {account.current_balance >= 0 ? "Available" : "Due"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                      <button
                        className="p-1.5 rounded-xl transition-colors active:bg-surface-alt"
                        onClick={() => handleOpenEdit(account)}
                      >
                        <MoreVertical className="w-4 h-4 text-ms-muted" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(account.id)}
                        className="p-1.5 rounded-xl transition-colors active:bg-surface-alt"
                      >
                        <Trash2 className="w-4 h-4 text-neg" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-2xl py-10 text-center">
              <p className="text-sm font-medium text-ink">No accounts yet</p>
              <p className="text-xs text-ms-muted mt-1">Add your first account to get started</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-bold text-ink mb-3">Quick Actions</h2>
          <AddAccount
            trigger={
              <button className="w-36 bg-surface border border-line rounded-2xl p-4 text-left active:bg-surface-alt transition-colors shadow-sm">
                <Plus className="w-5 h-5 text-ink mb-2" />
                <p className="text-sm font-bold text-ink">Add Account</p>
              </button>
            }
          />
        </div>
      </div>

      {/* Delete confirmation */}
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
            const a = accounts?.find((acc: ApiAccount) => acc.id === deleteAccountId)
            return a ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ms-muted">Type:</span>
                  <span className="font-medium capitalize text-ink">{a.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ms-muted">Balance:</span>
                  <span
                    className={`font-medium ${a.current_balance >= 0 ? "text-pos" : "text-neg"}`}
                  >
                    ₹ {a.current_balance.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null
          })()
        }
      />

      {selectedAccount && (
        <EditAccount
          trigger={<div style={{ display: "none" }} />}
          account={selectedAccount}
          onClose={handleCloseEdit}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </Page>
  )
}
