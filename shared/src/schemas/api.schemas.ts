import { z } from 'zod'

// Project schemas
export const projectStatusSchema = z.enum(['todo', 'in_progress', 'done'])
export const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(120),
  status: projectStatusSchema.optional().default('todo')
})
export const createProjectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: projectStatusSchema,
  createdAt: z.string().datetime()
})

// Auth schemas
export const authLoginRequestSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(8).max(128)
})
export const authLoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive()
})

// Utility: convert to JSON schema on demand (runtime import of zod-to-json-schema in backend)
export type InferredCreateProjectRequest = z.infer<typeof createProjectRequestSchema>
export type InferredCreateProjectResponse = z.infer<typeof createProjectResponseSchema>
export type InferredAuthLoginRequest = z.infer<typeof authLoginRequestSchema>
export type InferredAuthLoginResponse = z.infer<typeof authLoginResponseSchema>
