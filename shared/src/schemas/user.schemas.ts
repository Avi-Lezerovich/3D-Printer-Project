import { z } from 'zod'

export const userRoleSchema = z.enum(['user','admin'])
export const userSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  role: userRoleSchema,
  createdAt: z.string().datetime().optional()
})
export const registerUserSchema = userSchema.pick({ email: true, role: true }).extend({
  password: z.string().min(8).max(128)
})

export type User = z.infer<typeof userSchema>
