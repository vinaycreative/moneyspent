import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Call the database function
    const { data, error } = await supabase.rpc("get_transaction_summary", {
      p_user_id: user.id,
      p_start_date: startDate || undefined,
      p_end_date: endDate || undefined,
    })

    if (error) {
      console.error("Transaction summary error:", error)
      return NextResponse.json(
        { error: "Failed to fetch transaction summary" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      )
    }

    // Return the first result or default values
    const summary = data?.[0] || { total_expenses: 0, total_income: 0, net_savings: 0 }

    return new NextResponse(JSON.stringify({ summary }), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Transaction summary API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
} 