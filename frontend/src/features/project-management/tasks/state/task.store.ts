import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { Task, TimeEntry, TaskDependency } from '@3d/shared'

interface Filters {
  assignees: string[]
  priorities: string[]
  labels: string[]
  dateRange?: { from: string; to: string }
  search?: string
  status?: string[]
}

interface TaskState {
  tasks: Record<string, Task>
  taskIdsByStatus: Record<string, string[]>
  dependencies: TaskDependency[]
  timeEntries: Record<string, TimeEntry[]>
  filters: Filters
  selection: Set<string>
  loading: boolean
  error?: string
  upsertTasks: (tasks: Task[]) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  moveTask: (id: string, toStatus: string, newIndex: number) => void
  setFilters: (f: Partial<Filters>) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  bulkUpdateStatus: (ids: string[], status: Task['status']) => void
  startTimeEntry: (taskId: string) => string
  stopTimeEntry: (entryId: string) => void
  getColumnsWithFilters: () => { status: string; taskIds: string[] }[]
}

function makeId(): string {
  const maybeCrypto = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto
  if (maybeCrypto?.randomUUID) return maybeCrypto.randomUUID()
  return 'id_' + Math.random().toString(36).slice(2)
}

export const useTaskStore = create<TaskState>()(
  devtools(subscribeWithSelector((set, get) => ({
    tasks: {},
    taskIdsByStatus: {},
    dependencies: [],
    timeEntries: {},
    filters: { assignees: [], priorities: [], labels: [] },
    selection: new Set(),
    loading: false,
    upsertTasks: (tasks) => set(state => {
      if (!tasks.length) return {}
      const draftTasks = { ...state.tasks }
      const byStatus: Record<string, string[]> = { ...state.taskIdsByStatus }
      tasks.forEach(t => { draftTasks[t.id] = t })
      Object.keys(byStatus).forEach(k => { byStatus[k] = byStatus[k].filter(id => !!draftTasks[id]) })
      tasks.forEach(t => {
        if (!byStatus[t.status]) byStatus[t.status] = []
        if (!byStatus[t.status].includes(t.id)) byStatus[t.status].push(t.id)
      })
      return { tasks: draftTasks, taskIdsByStatus: byStatus }
    }),
    updateTask: (id, patch) => set(state => {
      const existing = state.tasks[id]
      if (!existing) return {}
      const updated: Task = { ...existing, ...patch, updatedAt: new Date().toISOString() }
      let taskIdsByStatus = state.taskIdsByStatus
      if (patch.status && patch.status !== existing.status) {
        taskIdsByStatus = { ...taskIdsByStatus }
        taskIdsByStatus[existing.status] = taskIdsByStatus[existing.status].filter(x => x !== id)
        if (!taskIdsByStatus[patch.status]) {
          taskIdsByStatus[patch.status] = []
        }
        taskIdsByStatus[patch.status].push(id)
      }
      return { tasks: { ...state.tasks, [id]: updated }, taskIdsByStatus }
    }),
    moveTask: (id, toStatus, newIndex) => set(state => {
      const task = state.tasks[id]
      if (!task) return {}
      const fromStatus = task.status
      const taskIdsByStatus = { ...state.taskIdsByStatus }
      taskIdsByStatus[fromStatus] = taskIdsByStatus[fromStatus]?.filter(x => x !== id) || []
      if (!taskIdsByStatus[toStatus]) {
        taskIdsByStatus[toStatus] = []
      }
      const dest = [...taskIdsByStatus[toStatus]]
      dest.splice(newIndex, 0, id)
      taskIdsByStatus[toStatus] = dest
      return { taskIdsByStatus, tasks: { ...state.tasks, [id]: { ...task, status: toStatus as Task['status'] } } }
    }),
    setFilters: (f) => set(state => ({ filters: { ...state.filters, ...f } })),
    toggleSelect: (id) => set(state => {
      const selection = new Set(state.selection)
      if (selection.has(id)) {
        selection.delete(id)
      } else {
        selection.add(id)
      }
      return { selection }
    }),
    clearSelection: () => set({ selection: new Set() }),
    bulkUpdateStatus: (ids, status) => {
      set(state => {
        const tasks = { ...state.tasks }
        const taskIdsByStatus = { ...state.taskIdsByStatus }
        for (const tid of ids) {
          const existing = tasks[tid]
          if (!existing) continue
          if (existing.status !== status) {
            taskIdsByStatus[existing.status] = (taskIdsByStatus[existing.status] || []).filter(x => x !== tid)
            if (!taskIdsByStatus[status]) taskIdsByStatus[status] = []
            if (!taskIdsByStatus[status].includes(tid)) taskIdsByStatus[status].push(tid)
          }
          tasks[tid] = { ...existing, status, updatedAt: new Date().toISOString() }
        }
        return { tasks, taskIdsByStatus }
      })
    },
    startTimeEntry: (taskId) => {
      const entry: TimeEntry = { id: makeId(), taskId, userId: 'currentUser', startedAt: new Date().toISOString() }
      set(state => {
        const list = state.timeEntries[taskId] ? [...state.timeEntries[taskId]] : []
        list.push(entry)
        return { timeEntries: { ...state.timeEntries, [taskId]: list } }
      })
      return entry.id
    },
    stopTimeEntry: (entryId) => set(state => {
      const timeEntries = { ...state.timeEntries }
      for (const taskId of Object.keys(timeEntries)) {
        let changed = false
        const list = timeEntries[taskId].map(e => {
          if (e.id === entryId && !e.endedAt) {
            changed = true
            return { ...e, endedAt: new Date().toISOString(), durationMs: Date.now() - new Date(e.startedAt).getTime() }
          }
          return e
        })
        if (changed) timeEntries[taskId] = list
      }
      return { timeEntries }
    }),
    getColumnsWithFilters: () => {
      const { taskIdsByStatus, tasks, filters } = get()
      const statuses = Object.keys(taskIdsByStatus)
      const predicate = (t: Task) => {
        if (filters.assignees.length && !filters.assignees.includes(t.assigneeId || '')) return false
        if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false
        if (filters.labels.length && !filters.labels.every(l => t.labels.includes(l))) return false
        if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.dateRange && t.dueDate) {
          if (t.dueDate < filters.dateRange.from || t.dueDate > filters.dateRange.to) return false
        }
        return true
      }
      return statuses.map(status => ({ status, taskIds: taskIdsByStatus[status].filter(id => predicate(tasks[id])) }))
    }
  })))
)
