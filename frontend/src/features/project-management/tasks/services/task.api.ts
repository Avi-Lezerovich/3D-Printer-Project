import { listTasksResponseSchema, taskSchema, type Task } from '@3d/shared'

const controllerMap = new Map<string, AbortController>()

function apiFetch<T>(key: string, input: RequestInfo, init?: RequestInit): Promise<T> {
  controllerMap.get(key)?.abort()
  const controller = new AbortController()
  controllerMap.set(key, controller)
  return fetch(input, { ...init, signal: controller.signal }).then(async r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as T
  })
}

export const TaskApi = {
  async list(params: { projectId: string }) {
    const qs = new URLSearchParams(params).toString()
    const data = await apiFetch<{ tasks: Task[] }>('listTasks', `/api/tasks?${qs}`)
    const parsed = listTasksResponseSchema.parse(data)
    return parsed.tasks
  },
  async update(id: string, patch: Partial<Pick<Task, 'title' | 'status'>>) {
    const resp = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    })
    const json = await resp.json()
    return taskSchema.parse(json)
  }
}
