"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import { AddTransactionModal } from "@/components/AddTransactionModal"
import { DashboardStats } from "@/components/DashboardStats"
import { useAuth } from "@/lib/contexts/auth-context"
import { useTransactions, useTransactionSummary } from "@/lib/hooks"

export default function Dashboard() {
  const { user, profile, isLoading } = useAuth()
  const [currentDate] = useState("Today")

  // Get user's transactions
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(user?.id || "", {
    enabled: !!user?.id,
  })

  // Get transaction summary
  const { data: summary, isLoading: summaryLoading } = useTransactionSummary(user?.id || "", {
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

  const transactionCount = transactions?.length || 0
  const totalExpenses = summary?.total_expenses || 0
  const totalIncome = summary?.total_income || 0
  const netSavings = summary?.net_savings || 0

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Mobile container - max width for desktop */}
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Header Section */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-black">Money Manager</h1>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button className="p-2 rounded-lg bg-gray-100">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="text-center">
                <div className="text-black font-medium">{currentDate}</div>
                <div className="text-sm text-gray-500">
                  {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
                </div>
              </div>

              <button className="p-2 rounded-lg bg-gray-100">
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="px-4 mb-6">
            <DashboardStats
              totalExpenses={totalExpenses}
              totalIncome={totalIncome}
              netSavings={netSavings}
              transactionCount={transactionCount}
              isLoading={summaryLoading}
            />
          </div>

          {/* Add Transaction Button */}
          <div className="px-4 mb-6">
            <AddTransactionModal>
              <button className="w-full bg-black text-white rounded-xl py-4 flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
            </AddTransactionModal>
          </div>

          {/* Recent Transactions */}
          <div className="px-4">
            <h2 className="text-lg font-bold text-black mb-4">Recent Transactions</h2>

            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.slice(0, 4).map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.categories?.color || "bg-gray-400"
                      } text-white font-bold`}
                    >
                      {transaction.categories?.icon || "💰"}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-black">{transaction.title}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.transaction_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div
                      className={`font-medium ${
                        transaction.type === "expense" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {transaction.type === "expense" ? "-" : "+"} ₹{" "}
                      {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg font-medium mb-2">No transactions yet</div>
                <div className="text-sm">Add your first transaction to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
