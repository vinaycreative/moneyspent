import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserService } from "@/lib/services/user-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data from request body
    const userData = await request.json()
    
    // Create or update user profile
    const userProfile = await UserService.createOrUpdateUser({
      id: user.id,
      email: user.email!,
      full_name: userData.full_name || user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: userData.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
    })

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile
    const userProfile = await UserService.getUserById(user.id)
    
    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
} 