import { z } from 'zod'
import { projectStatusSchema } from './api.schemas.js'

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  status: projectStatusSchema,
  createdAt: z.string().datetime()
})

export const projectUpdateSchema = projectSchema.pick({ name: true, status: true }).partial().refine(d => Object.keys(d).length > 0, { message: 'At least one field must be provided' })

export type Project = z.infer<typeof projectSchema>
