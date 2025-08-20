import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../task.store'
import type { Task } from '@3d/shared'

const baseTask = (id: string, status: Task['status']): Task => ({
  id, projectId: 'p', title: 'Task ' + id, status, priority: 'low', labels: [], orderIndex: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
})

describe('task.store', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: {}, taskIdsByStatus: {}, dependencies: [], timeEntries: {}, filters: { assignees: [], priorities: [], labels: [] }, selection: new Set(), loading: false })
  })

  it('upserts tasks and filters', () => {
    useTaskStore.getState().upsertTasks([baseTask('1','todo')])
    useTaskStore.getState().setFilters({ search: 'task' })
    const cols = useTaskStore.getState().getColumnsWithFilters()
    expect(cols.find(c => c.status === 'todo')?.taskIds).toContain('1')
  })

  it('moves task between statuses', () => {
    useTaskStore.getState().upsertTasks([baseTask('1','todo')])
    useTaskStore.getState().moveTask('1','in_progress',0)
    const cols = useTaskStore.getState().getColumnsWithFilters()
    expect(cols.find(c => c.status === 'in_progress')?.taskIds).toContain('1')
  })

  it('time tracking start/stop', () => {
    useTaskStore.getState().upsertTasks([baseTask('1','todo')])
    const id = useTaskStore.getState().startTimeEntry('1')
    useTaskStore.getState().stopTimeEntry(id)
    const entries = useTaskStore.getState().timeEntries['1']
    expect(entries?.[0].endedAt).toBeTruthy()
  })
})
