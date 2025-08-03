import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesInsert, TablesUpdate } from "@/types/supabase"
import { ensureUserExists } from "@/lib/utils"

type AccountInsert = TablesInsert<"accounts">
type AccountUpdate = TablesUpdate<"accounts">

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
    const isActive = searchParams.get("isActive")
    const type = searchParams.get("type")

    // Build query
    let query = supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true")
    }

    if (type) {
      query = query.eq("type", type)
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error("Accounts fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Accounts API error:", error)
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

    // Get account data from request body
    const accountData: AccountInsert = await request.json()

    // Add user_id to the account data
    const newAccount: AccountInsert = {
      ...accountData,
      user_id: user.id,
    }

    console.log("newAccount", newAccount)
    const { data: account, error } = await supabase
      .from("accounts")
      .insert(newAccount)
      .select()
      .single()

    if (error) {
      console.error("Account creation error:", error)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error("Account creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
