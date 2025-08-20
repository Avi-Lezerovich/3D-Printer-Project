import React from 'react'
import { useTaskStore } from '../../state/task.store'

export const FiltersBar: React.FC = () => {
  const filters = useTaskStore(s => s.filters)
  const setFilters = useTaskStore(s => s.setFilters)
  return (
    <div role="region" aria-label="Task filters" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
      <input aria-label="Search tasks" placeholder="Search…" value={filters.search || ''} onChange={e => setFilters({ search: e.target.value })} style={{ padding: '4px 8px', borderRadius: 8 }} />
      <select aria-label="Priority filter" value={filters.priorities[0] || ''} onChange={e => setFilters({ priorities: e.target.value ? [e.target.value] : [] })}>
        <option value="">Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <input aria-label="Assignee" placeholder="Assignee" value={filters.assignees[0] || ''} onChange={e => setFilters({ assignees: e.target.value ? [e.target.value] : [] })} style={{ padding: '4px 8px', borderRadius: 8 }} />
      <input aria-label="Label filter" placeholder="Label" onKeyDown={e => {
        if (e.key === 'Enter' && e.currentTarget.value) {
          const newLabels = [...filters.labels, e.currentTarget.value]
          setFilters({ labels: Array.from(new Set(newLabels)) })
          e.currentTarget.value = ''
        }
      }} style={{ padding: '4px 8px', borderRadius: 8 }} />
      {filters.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 4 }}>
          {filters.labels.map(label => (
            <button key={label} aria-label={`Remove label ${label}`} onClick={() => setFilters({ labels: filters.labels.filter(l => l !== label) })} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 12, padding: '2px 6px', cursor: 'pointer' }}>{label} ✕</button>
          ))}
        </div>
      )}
    </div>
  )
}
