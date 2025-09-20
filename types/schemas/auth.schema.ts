import { z } from "zod"

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

// Auth login request
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

// Auth login response
export const LoginResponseSchema = z.object({
  user: UserSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>

// Auth register request
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

// Profile update request
export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
})

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>