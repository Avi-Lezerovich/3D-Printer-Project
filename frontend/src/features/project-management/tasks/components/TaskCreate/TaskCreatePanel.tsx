import React, { useState } from 'react'
import { useTaskStore } from '../../state/task.store'
import type { Task } from '@3d/shared'

interface Props { projectId: string }

export const TaskCreatePanel: React.FC<Props> = ({ projectId }) => {
  const upsertTasks = useTaskStore(s => s.upsertTasks)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [labels, setLabels] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const resp = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: '', projectId, priority, labels }) })
      if (resp.ok) {
        const json = await resp.json()
        if (json.task) upsertTasks([{ ...json.task, labels: json.task.labels || [] }])
        setTitle('')
        setLabels([])
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleCreate} aria-label="Create task" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" aria-label="Task title" required />
      <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} aria-label="Priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {labels.map(l => <span key={l} style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 8 }}>{l}</span>)}
      </div>
      <input placeholder="Add label and press Enter" onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value) { e.preventDefault(); setLabels(prev => Array.from(new Set([...prev, e.currentTarget.value]))); e.currentTarget.value='' } }} />
      <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
    </form>
  )
}
