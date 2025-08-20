import { useCallback } from 'react'
import { useTaskStore } from '../state/task.store'

export function useBulkSelection() {
  const selection = useTaskStore(s => s.selection)
  const toggle = useTaskStore(s => s.toggleSelect)
  const clear = useTaskStore(s => s.clearSelection)
  const bulkUpdateStatus = useTaskStore(s => s.bulkUpdateStatus)
  const markDone = useCallback(() => bulkUpdateStatus(Array.from(selection), 'done'), [bulkUpdateStatus, selection])
  return { selection, toggle, clear, markDone }
}
