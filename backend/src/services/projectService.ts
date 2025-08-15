import crypto from 'node:crypto'
import { Repositories } from '../repositories/types.js'
import { withCache } from '../cache/cacheService.js'
import { eventBus, EVENT_VERSION } from '../realtime/eventBus.js'

export type ProjectStatus = 'todo' | 'in_progress' | 'done'
export interface Project { id: string; name: string; status: ProjectStatus; createdAt: string }

let repositories: Repositories | undefined
export function setRepositories(repos: Repositories) { repositories = repos }

// Fallback in-memory store (used until repositories initialized, e.g. in tests)
const memoryProjects = new Map<string, Project>()

export async function listProjects() {
  // Cache list for short TTL to smooth bursts
  return withCache<Project[]>("projects:all", 5, async () => {
    if (repositories) return (await repositories.projects.list()) as any as Project[]
    return Array.from(memoryProjects.values())
  })
}
export async function getProject(id: string) {
  if (repositories) return await repositories.projects.get(id) as any as Project | null
  return memoryProjects.get(id) || null
}
export async function createProject(name: string, status: ProjectStatus = 'todo') {
  if (repositories) {
    const created = await repositories.projects.create({ name, status }) as any as Project
    eventBus.emitEvent({ type: 'project.created', payload: { version: EVENT_VERSION, data: { id: created.id, name: created.name, status: created.status } } })
    return created
  }
  const project: Project = { id: crypto.randomUUID(), name, status, createdAt: new Date().toISOString() }
  memoryProjects.set(project.id, project)
  eventBus.emitEvent({ type: 'project.created', payload: { version: EVENT_VERSION, data: { id: project.id, name: project.name, status: project.status } } })
  return project
}
export async function updateProject(id: string, changes: Partial<Pick<Project, 'name' | 'status'>>) {
  if (repositories) {
    const updated = await repositories.projects.update(id, changes) as any as Project | null
    if (updated) eventBus.emitEvent({ type: 'project.updated', payload: { version: EVENT_VERSION, data: { id: updated.id, name: changes.name, status: changes.status } } })
    return updated
  }
  const current = memoryProjects.get(id)
  if (!current) return null
  const next: Project = { ...current, ...changes }
  memoryProjects.set(id, next)
  eventBus.emitEvent({ type: 'project.updated', payload: { version: EVENT_VERSION, data: { id: next.id, name: changes.name, status: changes.status } } })
  return next
}
export async function deleteProject(id: string) {
  if (repositories) {
    const existed = await repositories.projects.get(id)
    const result = await repositories.projects.remove(id)
    if (existed) eventBus.emitEvent({ type: 'project.deleted', payload: { version: EVENT_VERSION, data: { id } } })
    return result
  }
  const existed = memoryProjects.delete(id)
  if (existed) eventBus.emitEvent({ type: 'project.deleted', payload: { version: EVENT_VERSION, data: { id } } })
  return existed
}
