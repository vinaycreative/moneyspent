import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  try {
    console.log("By-category transactions API called")
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryName = searchParams.get("category")
    const dateRange = searchParams.get("dateRange")
    const customStartDate = searchParams.get("customStartDate")
    const customEndDate = searchParams.get("customEndDate")

    if (!categoryName) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    console.log("Looking for category:", categoryName)

    // Debug: Let's see what categories exist for this user
    const { data: allCategories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)

    // Find the category by name (case-insensitive)
    const foundCategory = allCategories?.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    )

    if (!foundCategory) {
      console.error("Category not found:", categoryName)
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Now fetch transactions for this category
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
      .eq("category_id", foundCategory.id)
      .eq("type", "expense")
      .order("transaction_date", { ascending: false })

    // Apply date filtering only if not "all"
    if (dateRange && dateRange !== "all") {
      const now = new Date()
      let startDate: Date | null = null

      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - now.getDay())
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        case "custom":
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate)
            const end = new Date(customEndDate)
            end.setHours(23, 59, 59, 999)
            query = query
              .gte("transaction_date", start.toISOString())
              .lte("transaction_date", end.toISOString())
          }
          break
        default:
          // Default to current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Apply date filter for non-custom ranges
      if (dateRange !== "custom" && startDate) {
        query = query.gte("transaction_date", startDate.toISOString())
      }
    }

    console.log("Executing query with category_id:", foundCategory.id)
    const { data: transactions, error } = await query

    console.log("API response:", {
      category: categoryName,
      categoryId: foundCategory.id,
      transactions: transactions?.length,
      error,
    })

    if (error) {
      console.error("Error fetching category transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error("Error in by-category transactions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
