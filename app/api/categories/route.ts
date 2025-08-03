import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TablesInsert, TablesUpdate } from "@/types/supabase"
import { ensureUserExists } from "@/lib/utils"

type CategoryInsert = TablesInsert<"categories">
type CategoryUpdate = TablesUpdate<"categories">

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
    const type = searchParams.get("type")

    // Build query
    let query = supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (type) {
      query = query.eq("type", type)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error("Categories fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories API error:", error)
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

    // Get category data from request body
    const categoryData: CategoryInsert = await request.json()

    // Add user_id to the category data
    const newCategory: CategoryInsert = {
      ...categoryData,
      user_id: user.id,
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert(newCategory)
      .select()
      .single()

    if (error) {
      console.error("Category creation error:", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Category creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
