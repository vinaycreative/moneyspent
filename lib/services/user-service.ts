import { supabase } from "@/lib/supabase/client"
import { TablesInsert, TablesUpdate } from "@/types/supabase"

type UserInsert = TablesInsert<"users">
type UserUpdate = TablesUpdate<"users">

export class UserService {
  /**
   * Create or update user profile in the database
   */
  static async createOrUpdateUser(userData: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }): Promise<any> {
    try {
      // First, check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Failed to check existing user: ${fetchError.message}`)
      }

      if (existingUser) {
        // User exists, update if needed
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            email: userData.email,
            full_name: userData.full_name || existingUser.full_name,
            avatar_url: userData.avatar_url || existingUser.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.id)
          .select()
          .single()

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`)
        }

        return updatedUser
      } else {
        // User doesn't exist, create new user
        const newUser: UserInsert = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name || null,
          avatar_url: userData.avatar_url || null,
          currency: "INR",
          timezone: "Asia/Kolkata",
        }

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert(newUser)
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`)
        }

        return createdUser
      }
    } catch (error) {
      console.error("UserService.createOrUpdateUser error:", error)
      throw error
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserById(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        throw new Error(`Failed to get user: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("UserService.getUserById error:", error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: UserUpdate): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("UserService.updateUser error:", error)
      throw error
    }
  }

  /**
   * Get current authenticated user with profile
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Failed to get authenticated user: ${authError.message}`)
      }

      if (!user) {
        return null
      }

      // Get user profile from database
      const profile = await this.getUserById(user.id)
      return profile
    } catch (error) {
      console.error("UserService.getCurrentUser error:", error)
      throw error
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId)

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`)
      }
    } catch (error) {
      console.error("UserService.deleteUser error:", error)
      throw error
    }
  }
} 