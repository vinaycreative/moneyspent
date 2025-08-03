import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { UserService } from "@/lib/services/user-service"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures that a user exists in the users table.
 * If the user doesn't exist, creates their profile.
 * This is needed because Supabase auth creates users in auth.users
 * but not in our custom users table.
 */
export async function ensureUserExists(user: any): Promise<void> {
  try {
    await UserService.getUserById(user.id)
  } catch (error) {
    // User doesn't exist in users table, create them
    console.log("User not found in users table, creating profile...")
    await UserService.createOrUpdateUser({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    })
  }
}
