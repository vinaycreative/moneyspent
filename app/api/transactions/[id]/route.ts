import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesUpdate } from "@/types/supabase"
import { calculateNewBalance, calculateReversedBalance } from "@/lib/utils"

type TransactionUpdate = TablesUpdate<"transactions">

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories(name, icon),
        accounts(name)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }
      console.error("Transaction fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Transaction API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the existing transaction to calculate balance changes
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("amount, type, account_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }
      console.error("Transaction fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
    }

    // Get transaction data from request body
    const transactionData: TransactionUpdate = await request.json()

    // Update the transaction
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update({
        ...transactionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        categories(name, icon),
        accounts(name)
      `
      )
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }
      console.error("Transaction update error:", error)
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }

    // Update account balance if account_id is provided
    if (transactionData.account_id) {
      // Get current account balance
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", transactionData.account_id)
        .eq("user_id", user.id)
        .single()

      if (accountError) {
        console.error("Account fetch error:", accountError)
        return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
      }

      // Calculate balance change
      const currentBalance = account.balance || 0
      const oldAmount = existingTransaction.amount || 0
      const newAmount = transactionData.amount || 0
      const oldType = existingTransaction.type
      const newType = transactionData.type

      // Reverse the old transaction effect
      let adjustedBalance = currentBalance
      adjustedBalance = calculateReversedBalance(adjustedBalance, oldAmount, oldType || "expense")

      // Apply the new transaction effect
      const newBalance = calculateNewBalance(adjustedBalance, newAmount, newType || "expense")

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", transactionData.account_id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Account balance update error:", updateError)
        return NextResponse.json({ error: "Failed to update account balance" }, { status: 500 })
      }
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Transaction update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the existing transaction to calculate balance changes
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("amount, type, account_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update account balance if account_id is provided
    if (existingTransaction.account_id) {
      // Get current account balance
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", existingTransaction.account_id)
        .eq("user_id", user.id)
        .single()

      if (accountError) {
        console.error("Account fetch error:", accountError)
        return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
      }

      // Calculate new balance by reversing the transaction effect
      const currentBalance = account.balance || 0
      const transactionAmount = existingTransaction.amount || 0
      const newBalance = calculateReversedBalance(currentBalance, transactionAmount, existingTransaction.type)

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingTransaction.account_id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Account balance update error:", updateError)
        return NextResponse.json({ error: "Failed to update account balance" }, { status: 500 })
      }
    }

    // Delete the transaction
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the transaction

    if (error) {
      console.error("Transaction deletion error:", error)
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
    }

    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Transaction deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
