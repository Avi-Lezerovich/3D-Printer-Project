import React, { useEffect } from 'react'
import { useTaskStore } from '../../state/task.store'
import { TaskCard } from '../../components/TaskCard/TaskCard'
import { FiltersBar } from '../../components/FiltersBar/FiltersBar'
import { BulkActionsBar } from '../../components/BulkActionsBar/BulkActionsBar'
import '../../services/task.realtime'
import { useVirtualizer } from '@tanstack/react-virtual'

interface TaskBoardProps { projectId: string }

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  const columns = useTaskStore(s => s.getColumnsWithFilters())
  const upsertTasks = useTaskStore(s => s.upsertTasks)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Using versioned project-management route; project scoping placeholder until backend supports it
        const resp = await fetch(`/api/v1/project-management/tasks`)
        if (!resp.ok) return
        const json = await resp.json()
        if (!cancelled && json?.tasks) upsertTasks(json.tasks)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [projectId, upsertTasks])

  return (
    <div className="pm-task-board" aria-label="Task board">
      <FiltersBar />
      <BulkActionsBar />
      <div className="pm-task-board__columns" style={{ display: 'grid', gap: '1rem', gridAutoFlow: 'column', overflowX: 'auto' }}>
        {columns.map((col) => (
          <Column key={col.status} status={col.status} taskIds={col.taskIds} />
        ))}
      </div>
    </div>
  )
}

const COLUMN_ITEM_HEIGHT = 140

const Column: React.FC<{ status: string; taskIds: string[] }> = ({ status, taskIds }) => {
  const tasks = useTaskStore(s => s.tasks)
  const parentRef = React.useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: taskIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => COLUMN_ITEM_HEIGHT,
    overscan: 4
  })
  return (
    <section className="pm-task-column" aria-label={status} style={{ minWidth: 300 }}>
      <header style={{ fontWeight: 600, marginBottom: 8 }}>{status} ({taskIds.length})</header>
      <div ref={parentRef} style={{ height: '70vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((v: ReturnType<typeof rowVirtualizer.getVirtualItems>[number]) => {
            const taskId = taskIds[v.index]
            const task = tasks[taskId]
            if (!task) return null
            return (
              <div key={task.id} style={{ position: 'absolute', top: v.start, left: 0, right: 0 }} data-index={v.index}>
                <TaskCard task={task} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
