"use client"

import { useState } from "react"
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useCurrentUser,
  useUpdateCurrentUser,
  useSignOut,
} from "@/lib/hooks"

// Example component showing how to use all the hooks
export function ExampleUsage() {
  const [userId, setUserId] = useState("user-id")
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
  })

  // User hooks
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const updateUser = useUpdateCurrentUser()
  const signOut = useSignOut()

  // Transaction hooks
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(userId, {
    startDate: selectedDateRange.startDate,
    endDate: selectedDateRange.endDate,
  })

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  // Category hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories(userId)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  // Account hooks
  const { data: accounts, isLoading: accountsLoading } = useAccounts(userId, { isActive: true })

  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  // Example functions for CRUD operations
  const handleCreateTransaction = async () => {
    try {
      await createTransaction.mutateAsync({
        user_id: userId,
        title: "New Transaction",
        amount: 100.0,
        type: "expense",
        transaction_date: new Date().toISOString().split("T")[0],
        category_id: categories?.[0]?.id || null,
        account_id: accounts?.[0]?.id || null,
        description: "Example transaction",
      })
      console.log("Transaction created successfully!")
    } catch (error) {
      console.error("Failed to create transaction:", error)
    }
  }

  const handleUpdateTransaction = async (transactionId: string) => {
    try {
      await updateTransaction.mutateAsync({
        id: transactionId,
        title: "Updated Transaction",
        amount: 150.0,
      })
      console.log("Transaction updated successfully!")
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction.mutateAsync(transactionId)
      console.log("Transaction deleted successfully!")
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
  }

  const handleCreateCategory = async () => {
    try {
      await createCategory.mutateAsync({
        user_id: userId,
        name: "New Category",
        type: "expense",
        icon: "📁",
        color: "bg-gray-400",
      })
      console.log("Category created successfully!")
    } catch (error) {
      console.error("Failed to create category:", error)
    }
  }

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      await updateCategory.mutateAsync({
        id: categoryId,
        name: "Updated Category",
        icon: "🎯",
        color: "bg-blue-400",
      })
      console.log("Category updated successfully!")
    } catch (error) {
      console.error("Failed to update category:", error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId)
      console.log("Category deleted successfully!")
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  const handleCreateAccount = async () => {
    try {
      await createAccount.mutateAsync({
        user_id: userId,
        name: "New Account",
        type: "bank",
        balance: 1000.0,
        currency: "INR",
      })
      console.log("Account created successfully!")
    } catch (error) {
      console.error("Failed to create account:", error)
    }
  }

  const handleUpdateAccount = async (accountId: string) => {
    try {
      await updateAccount.mutateAsync({
        id: accountId,
        name: "Updated Account",
        balance: 1500.0,
      })
      console.log("Account updated successfully!")
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId)
      console.log("Account deleted successfully!")
    } catch (error) {
      console.error("Failed to delete account:", error)
    }
  }

  const handleUpdateUser = async () => {
    try {
      await updateUser.mutateAsync({
        full_name: "Updated User Name",
        currency: "USD",
      })
      console.log("User updated successfully!")
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync()
      console.log("Signed out successfully!")
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  // Loading states
  if (userLoading || transactionsLoading || categoriesLoading || accountsLoading) {
    return <div>Loading...</div>
  }

  // Error handling
  if (transactionsError) {
    return <div>Error loading transactions: {transactionsError.message}</div>
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">TanStack Query Hooks Example</h1>

      {/* User Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">User</h2>
        <p>Current User: {currentUser?.full_name || currentUser?.email}</p>
        <button
          onClick={handleUpdateUser}
          disabled={updateUser.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {updateUser.isPending ? "Updating..." : "Update User"}
        </button>
        <button
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="bg-red-500 text-white px-4 py-2 rounded ml-2 disabled:opacity-50"
        >
          {signOut.isPending ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      {/* Transactions Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Transactions</h2>
        <p>Total Transactions: {transactions?.length || 0}</p>
        <button
          onClick={handleCreateTransaction}
          disabled={createTransaction.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {createTransaction.isPending ? "Creating..." : "Create Transaction"}
        </button>
        {transactions?.slice(0, 3).map((transaction) => (
          <div key={transaction.id} className="mt-2 p-2 bg-gray-100 rounded">
            <p>
              {transaction.title} - ₹{transaction.amount}
            </p>
            <button
              onClick={() => handleUpdateTransaction(transaction.id)}
              disabled={updateTransaction.isPending}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              disabled={deleteTransaction.isPending}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm ml-2 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Categories Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
        <p>Total Categories: {categories?.length || 0}</p>
        <button
          onClick={handleCreateCategory}
          disabled={createCategory.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {createCategory.isPending ? "Creating..." : "Create Category"}
        </button>
        {categories?.slice(0, 3).map((category) => (
          <div key={category.id} className="mt-2 p-2 bg-gray-100 rounded">
            <p>
              {category.icon} {category.name} ({category.type})
            </p>
            <button
              onClick={() => handleUpdateCategory(category.id)}
              disabled={updateCategory.isPending}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              disabled={deleteCategory.isPending}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm ml-2 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Accounts Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Accounts</h2>
        <p>Total Accounts: {accounts?.length || 0}</p>
        <button
          onClick={handleCreateAccount}
          disabled={createAccount.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {createAccount.isPending ? "Creating..." : "Create Account"}
        </button>
        {accounts?.slice(0, 3).map((account) => (
          <div key={account.id} className="mt-2 p-2 bg-gray-100 rounded">
            <p>
              {account.name} - ₹{account.balance} ({account.type})
            </p>
            <button
              onClick={() => handleUpdateAccount(account.id)}
              disabled={updateAccount.isPending}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteAccount(account.id)}
              disabled={deleteAccount.isPending}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm ml-2 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
