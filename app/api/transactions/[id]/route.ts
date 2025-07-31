import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesUpdate } from "@/types/supabase"

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

    // Get transaction data from request body
    const transactionData: TransactionUpdate = await request.json()

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

    // Check if transaction exists and belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
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
