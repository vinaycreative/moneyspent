import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesInsert, TablesUpdate } from "@/types/supabase"
import { ensureUserExists, calculateNewBalance } from "@/lib/utils"

type TransactionInsert = TablesInsert<"transactions">
type TransactionUpdate = TablesUpdate<"transactions">

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    // Build query
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        ),
        accounts (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("transaction_date", { ascending: false })

    if (startDate) {
      query = query.gte("transaction_date", startDate)
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate)
    }

    if (type) {
      query = query.eq("type", type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error("Transactions fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Transactions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user exists in the users table
    await ensureUserExists(user)

    // Get transaction data from request body
    const transactionData: TransactionInsert = await request.json()

    // Add user_id to the transaction data
    const newTransaction: TransactionInsert = {
      ...transactionData,
      user_id: user.id,
    }

    // Start a transaction to ensure both operations succeed or fail together
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert(newTransaction)
      .select(
        `
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        ),
        accounts (
          id,
          name,
          type
        )
      `
      )
      .single()

    if (transactionError) {
      console.error("Transaction creation error:", transactionError)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
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

      // Calculate new balance
      const currentBalance = account.balance || 0
      const transactionAmount = transactionData.amount || 0
      const newBalance = calculateNewBalance(currentBalance, transactionAmount, transactionData.type)

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

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error("Transaction creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
