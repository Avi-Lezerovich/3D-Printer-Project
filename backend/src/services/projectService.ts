import crypto from 'node:crypto'
import { Repositories } from '../repositories/types.js'
import { withCache } from '../cache/cacheService.js'

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
  if (repositories) return await repositories.projects.create({ name, status }) as any as Project
  const project: Project = { id: crypto.randomUUID(), name, status, createdAt: new Date().toISOString() }
  memoryProjects.set(project.id, project)
  return project
}
export async function updateProject(id: string, changes: Partial<Pick<Project, 'name' | 'status'>>) {
  if (repositories) return await repositories.projects.update(id, changes) as any as Project | null
  const current = memoryProjects.get(id)
  if (!current) return null
  const next: Project = { ...current, ...changes }
  memoryProjects.set(id, next)
  return next
}
export async function deleteProject(id: string) {
  if (repositories) return await repositories.projects.remove(id)
  return memoryProjects.delete(id)
}
