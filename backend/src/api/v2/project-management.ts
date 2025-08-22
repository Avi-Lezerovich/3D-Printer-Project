import { Router } from 'express'
import { authenticateJWT } from '../../middleware/authMiddleware.js'
import { z } from 'zod'
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js'
import crypto from 'node:crypto'

// V2 Project Management Routes - Tasks, Budget, Inventory
const router = Router()

// Task types aligned with frontend domain models
interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'review' | 'done' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: string
  dueDate?: string
  estimateHours?: number
  labels: string[]
  createdAt: string
  updatedAt: string
}

// In-memory storage for demo (replace with proper repository)
const tasks = new Map<string, Task>()
const budgetCategories = new Map<string, any>()
const budgetExpenses = new Map<string, any>()
const inventoryItems = new Map<string, any>()

// Task schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  status: z.enum(['backlog', 'todo', 'in_progress', 'blocked', 'review', 'done', 'archived']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimateHours: z.number().positive().optional(),
  labels: z.array(z.string()).default([])
})

const updateTaskSchema = createTaskSchema.partial()

const taskQuerySchema = z.object({
  status: z.enum(['backlog', 'todo', 'in_progress', 'blocked', 'review', 'done', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignee: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

// === TASK ROUTES ===

// GET /tasks - List tasks with filtering
router.get('/tasks', authenticateJWT, validateQuery(taskQuerySchema), async (req, res) => {
  const query = (req as any).validatedQuery as z.infer<typeof taskQuerySchema>
  let filteredTasks = Array.from(tasks.values())
  
  // Apply filters
  if (query.status) {
    filteredTasks = filteredTasks.filter(task => task.status === query.status)
  }
  if (query.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === query.priority)  
  }
  if (query.assignee) {
    filteredTasks = filteredTasks.filter(task => task.assignee === query.assignee)
  }
  if (query.search) {
    const searchLower = query.search.toLowerCase()
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    )
  }
  
  // Apply pagination
  const total = filteredTasks.length
  const paginatedTasks = filteredTasks.slice(query.offset, query.offset + query.limit)
  
  res.setHeader('X-Total-Count', String(total))
  res.json(paginatedTasks)
})

// GET /tasks/:id - Get single task
router.get('/tasks/:id', authenticateJWT, validateParams(z.object({ id: z.string() })), async (req, res) => {
  const { id } = (req as any).validatedParams
  const task = tasks.get(id)
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        status: 404,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  res.json(task)
})

// POST /tasks - Create task
router.post('/tasks', authenticateJWT, validateBody(createTaskSchema), async (req, res) => {
  const body = (req as any).validatedBody as z.infer<typeof createTaskSchema>
  
  const task: Task = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  tasks.set(task.id, task)
  res.status(201).json(task)
})

// PUT /tasks/:id - Update task
router.put('/tasks/:id', authenticateJWT, validateParams(z.object({ id: z.string() })), validateBody(updateTaskSchema), async (req, res) => {
  const { id } = (req as any).validatedParams
  const body = (req as any).validatedBody as z.infer<typeof updateTaskSchema>
  
  const existingTask = tasks.get(id)
  if (!existingTask) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        status: 404,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  const updatedTask: Task = {
    ...existingTask,
    ...body,
    updatedAt: new Date().toISOString()
  }
  
  tasks.set(id, updatedTask)
  res.json(updatedTask)
})

// DELETE /tasks/:id - Delete task
router.delete('/tasks/:id', authenticateJWT, validateParams(z.object({ id: z.string() })), async (req, res) => {
  const { id } = (req as any).validatedParams
  
  if (!tasks.has(id)) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
        status: 404,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  tasks.delete(id)
  res.status(204).end()
})

// === BUDGET ROUTES (Basic structure) ===

router.get('/budget/categories', authenticateJWT, async (_req, res) => {
  res.json(Array.from(budgetCategories.values()))
})

router.get('/budget/expenses', authenticateJWT, async (_req, res) => {
  res.json(Array.from(budgetExpenses.values()))
})

// === INVENTORY ROUTES (Basic structure) ===

router.get('/inventory', authenticateJWT, async (_req, res) => {
  res.json(Array.from(inventoryItems.values()))
})

export default router