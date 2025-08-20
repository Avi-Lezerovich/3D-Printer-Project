import { useCallback } from 'react'
import { useTaskStore } from '../state/task.store'

export function useTaskFilters() {
  const filters = useTaskStore(s => s.filters)
  const setFilters = useTaskStore(s => s.setFilters)
  const update = useCallback((patch: Partial<typeof filters>) => setFilters(patch), [setFilters])
  return { filters, update }
}
