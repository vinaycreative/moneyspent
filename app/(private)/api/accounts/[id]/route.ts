import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesUpdate } from "@/types/supabase"

type AccountUpdate = TablesUpdate<"accounts">

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

    const { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Account not found" }, { status: 404 })
      }
      console.error("Account fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Account API error:", error)
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

    // Get account data from request body
    const accountData: AccountUpdate = await request.json()

    const { data: account, error } = await supabase
      .from("accounts")
      .update({
        ...accountData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Account not found" }, { status: 404 })
      }
      console.error("Account update error:", error)
      return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Account update API error:", error)
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

    const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Account deletion error:", error)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
