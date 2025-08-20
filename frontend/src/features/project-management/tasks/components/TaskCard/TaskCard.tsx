import React from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@3d/shared'
import { useTaskStore } from '../../state/task.store'

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const toggleSelect = useTaskStore(s => s.toggleSelect)
  const selected = useTaskStore(s => s.selection.has(task.id))
  return (
    <motion.article
      layout
      role="article"
      aria-label={task.title}
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ translateY: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); toggleSelect(task.id) } }}
      onClick={() => toggleSelect(task.id)}
      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px) saturate(140%)', border: selected ? '2px solid var(--accent, #4f46e5)' : '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '0.75rem', margin: '0.25rem', cursor: 'pointer' }}
    >
      <header style={{ fontWeight: 600 }}>{task.title}</header>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{task.priority} • {task.status}</div>
      {task.labels?.length ? (
        <ul aria-label="labels" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
          {task.labels.map(l => <li key={l} style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 6 }}>{l}</li>)}
        </ul>
      ) : null}
    </motion.article>
  )
}
