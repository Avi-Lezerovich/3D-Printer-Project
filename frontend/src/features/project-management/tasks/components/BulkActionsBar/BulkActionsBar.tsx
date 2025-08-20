import React from 'react'
import { useTaskStore } from '../../state/task.store'
import { motion } from 'framer-motion'

export const BulkActionsBar: React.FC = () => {
  const selectionSize = useTaskStore(s => s.selection.size)
  const bulkUpdateStatus = useTaskStore(s => s.bulkUpdateStatus)
  const selection = Array.from(useTaskStore.getState().selection)
  if (!selectionSize) return null
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} role="toolbar" aria-label="Bulk task actions" style={{ display: 'flex', gap: 8, padding: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 12, marginBottom: 12 }}>
      <span>{selectionSize} selected</span>
      <button onClick={() => bulkUpdateStatus(selection, 'in_progress')}>Mark In Progress</button>
      <button onClick={() => bulkUpdateStatus(selection, 'done')}>Mark Done</button>
    </motion.div>
  )
}
