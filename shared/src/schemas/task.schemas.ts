import { z } from 'zod'

// Extended task domain (Phase 1). Kept separate to avoid breaking existing TaskModel usages.

export const taskStatusSchema = z.enum(['backlog','todo','in_progress','blocked','review','done','archived'])
export const taskPrioritySchema = z.enum(['low','medium','high','urgent'])

export const timeEntrySchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationMs: z.number().int().positive().optional(),
  note: z.string().max(500).optional()
}).refine(d => !d.endedAt || new Date(d.endedAt) >= new Date(d.startedAt), { message: 'endedAt must be >= startedAt' })

export const attachmentMetaSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  storageKey: z.string(),
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string(),
  checksum: z.string().optional()
})

export const commentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  authorId: z.string(),
  body: z.string().min(1),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().optional(),
  mentions: z.array(z.string()).max(20).optional(),
  attachments: z.array(attachmentMetaSchema).optional(),
  version: z.number().int().positive().default(1)
})

export const taskDependencyTypeSchema = z.enum(['blocks','relates','duplicate'])
export const taskDependencySchema = z.object({
  fromTaskId: z.string(),
  toTaskId: z.string(),
  type: taskDependencyTypeSchema
})

export const subtaskSummarySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: taskStatusSchema,
  assigneeId: z.string().optional(),
  estimateHours: z.number().positive().max(1000).optional(),
  progress: z.number().min(0).max(1).optional()
})

export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  parentId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  labels: z.array(z.string()).max(50).default([]),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  estimateHours: z.number().positive().max(1000).optional(),
  spentHours: z.number().nonnegative().optional(),
  dueDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  orderIndex: z.number(),
  progress: z.number().min(0).max(1).optional(),
  subtasks: z.array(subtaskSummarySchema).optional(),
  dependencies: z.array(taskDependencySchema).optional(),
  timeEntries: z.array(timeEntrySchema).optional(),
  riskScore: z.number().min(0).max(1).optional(),
  customFields: z.record(z.any()).optional()
}).strict()

export const taskTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(140),
  description: z.string().optional(),
  defaultFields: taskSchema.partial().omit({ id: true, subtasks: true, timeEntries: true }),
  createdBy: z.string(),
  createdAt: z.string().datetime()
})

export const listTasksResponseSchema = z.object({ tasks: z.array(taskSchema) })

export type Task = z.infer<typeof taskSchema>
export type TaskTemplate = z.infer<typeof taskTemplateSchema>
export type TimeEntry = z.infer<typeof timeEntrySchema>
export type Comment = z.infer<typeof commentSchema>
export type AttachmentMeta = z.infer<typeof attachmentMetaSchema>
export type TaskDependency = z.infer<typeof taskDependencySchema>
