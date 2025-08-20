/** New TasksView integrated with advanced TaskBoard + creation panel */
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TaskBoard } from '../../../project-management/tasks/components/TaskBoard/TaskBoard'
import { TaskCreatePanel } from '../../../project-management/tasks/components/TaskCreate/TaskCreatePanel'
import { useTaskStore } from '../../../project-management/tasks/state/task.store'

export const TasksView: React.FC = () => {
  // Aggregate stats from store
  const tasksRecord = useTaskStore(s => s.tasks)
  const stats = useMemo(() => {
    const tasks = Object.values(tasksRecord)
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const blocked = tasks.filter(t => t.status === 'blocked').length
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    return { total, completed, inProgress, blocked, overdue }
  }, [tasksRecord])

  // Placeholder project id (backend not yet project-aware for tasks)
  const projectId = 'default'

  return (
    <div className="tasks-view" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div
        className="tasks-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-content">
          <h2 style={{ margin: 0 }}>✅ Task Management</h2>
          <p style={{ marginTop: 4 }}>Collaborative Kanban board with filters, bulk actions & time tracking</p>
        </div>
      </motion.div>

      <motion.section
        className="tasks-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className="stats-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
          <Stat label="Total" value={stats.total} icon="📋" />
          <Stat label="In Progress" value={stats.inProgress} icon="🔄" />
            <Stat label="Blocked" value={stats.blocked} icon="⛔" />
          <Stat label="Completed" value={stats.completed} icon="✅" />
          <Stat label="Overdue" value={stats.overdue} icon="⚠️" />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        aria-label="Create task"
      >
        <TaskCreatePanel projectId={projectId} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        aria-label="Board"
      >
        <TaskBoard projectId={projectId} />
      </motion.section>
    </div>
  )
}

const Stat: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
  <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ fontSize: 20 }}>{icon}</div>
    <div style={{ fontWeight: 600, fontSize: 22 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
  </div>
)
