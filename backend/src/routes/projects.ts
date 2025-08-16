import { Router } from 'express'
import { param, validationResult } from 'express-validator'
import { setCache } from '../middleware/cacheMiddleware.js'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validate.js'
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../services/projectService.js'
import { authenticateJWT } from '../middleware/authMiddleware.js'
import { requirePermission } from '../middleware/permissionMiddleware.js'

const router = Router()

router.get('/', setCache(10), async (_req, res) => {
	const projectsList = await listProjects()
	res.json({ projects: projectsList })
})

router.get('/:id', param('id').isString(), setCache(10), async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
	const id = (req.params as any).id as string
	const proj = await getProject(id)
	if (!proj) return res.status(404).json({ message: 'Project not found' })
	res.json({ project: proj })
})

const projectBodySchema = z.object({
	name: z.string().min(1).max(100).trim(),
	status: z.enum(['todo', 'in_progress', 'done']).optional()
})

router.post('/', authenticateJWT, requirePermission('project.write'), validateBody(projectBodySchema), async (req, res) => {
	const data = (req as any).validatedBody as z.infer<typeof projectBodySchema>
	const project = await createProject(data.name, data.status || 'todo')
	res.status(201).json({ project })
})

const projectUpdateBody = projectBodySchema.partial()
const idParamSchema = z.object({ id: z.string().min(1) })

router.put('/:id', authenticateJWT, requirePermission('project.write'), validateParams(idParamSchema), validateBody(projectUpdateBody), async (req, res) => {
	const id = (req as any).validatedParams.id as string
	const data = (req as any).validatedBody as z.infer<typeof projectUpdateBody>
	const updated = await updateProject(id, { name: data.name, status: data.status })
	if (!updated) return res.status(404).json({ message: 'Project not found' })
	res.json({ project: updated })
})

router.delete('/:id', authenticateJWT, requirePermission('project.write'), param('id').isString(), async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
	const id = (req.params as any).id as string
	await deleteProject(id)
	res.status(204).end()
})

// 405 for unsupported methods on collection and item
router.all('/', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))
router.all('/:id', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }))

export default router
