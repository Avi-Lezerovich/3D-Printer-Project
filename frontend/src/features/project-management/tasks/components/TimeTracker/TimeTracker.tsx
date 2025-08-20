import React, { useState } from 'react'
import { useTaskStore } from '../../state/task.store'

export const TimeTracker: React.FC<{ taskId: string }> = ({ taskId }) => {
  const start = useTaskStore(s => s.startTimeEntry)
  const stop = useTaskStore(s => s.stopTimeEntry)
  const entries = useTaskStore(s => s.timeEntries[taskId] || [])
  const [runningId, setRunningId] = useState<string | null>(null)
  const running = runningId ? entries.find(e => e.id === runningId) : undefined
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {running ? (
        <button onClick={() => { stop(running.id); setRunningId(null) }}>Stop</button>
      ) : (
        <button onClick={() => setRunningId(start(taskId))}>Start</button>
      )}
      <span style={{ fontSize: 12 }}>
        {entries.reduce((acc, e) => acc + (e.durationMs || (e.startedAt && e.endedAt ? (new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime()) : 0)), 0) / 3600000}h
      </span>
    </div>
  )
}
