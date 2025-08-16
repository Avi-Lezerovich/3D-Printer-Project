import { Router } from 'express'
import { authenticateJWT } from '../../middleware/authMiddleware.js'
import { createProjectRequestSchema } from '@3d/shared'
import { z } from 'zod'
import { validateBody } from '../../middleware/validate.js'
import { listProjects, createProject } from '../../services/projectService.js'

// v2 route: returns array directly (no wrapper), uses shared schemas, ETag + pagination placeholder
const router = Router()

router.get('/', authenticateJWT, async (req, res) => {
  const projects = await listProjects()
  // Simple pagination placeholders
  res.setHeader('X-Total-Count', String(projects.length))
  res.json(projects)
})

router.post('/', authenticateJWT, validateBody(createProjectRequestSchema as unknown as z.ZodTypeAny), async (req, res) => {
  const body = (req as any).validatedBody as z.infer<typeof createProjectRequestSchema>
  const project = await createProject(body.name, body.status)
  res.status(201).json(project)
})

export default router
