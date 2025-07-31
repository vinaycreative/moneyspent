"use client"

import { useState } from "react"
import { Building2, CreditCard, Plus, Eye, EyeOff, Wallet, PiggyBank } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAccounts } from "@/lib/hooks"
import { AddAccountModal } from "@/components/AddAccountModal"

export default function AccountsPage() {
  const { user, isLoading } = useAuth()
  const [showBalances, setShowBalances] = useState(true)

  // Get user's accounts
  const { data: accounts, isLoading: accountsLoading } = useAccounts(user?.id || "", {
    enabled: !!user?.id,
  })

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

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0

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

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Header */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-black">My Accounts</h1>
              <AddAccountModal>
                <button className="p-2 rounded-lg bg-purple-100">
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
                <button onClick={() => setShowBalances(!showBalances)} className="p-1 rounded">
                  {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-3xl font-bold">
                {showBalances ? `₹ ${totalBalance.toLocaleString()}` : "₹ ****"}
              </div>
              <div className="text-sm opacity-90 mt-1">{accounts?.length || 0} accounts</div>
            </div>
          </div>

          {/* Accounts List */}
          <div className="px-4">
            <h2 className="text-lg font-bold text-black mb-4">All Accounts</h2>
            
            {accountsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : accounts && accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account) => {
                  const Icon = getAccountIcon(account.type)
                  const color = getAccountColor(account.type)
                  
                  return (
                    <div
                      key={account.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-black">{account.name}</div>
                        {account.account_number && (
                          <div className="text-sm text-gray-500">{account.account_number}</div>
                        )}
                        <div className="text-xs text-gray-400 capitalize">{account.type.replace("_", " ")}</div>
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
          <div className="px-4 mt-6">
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
        </div>
      </div>
    </div>
  )
}
