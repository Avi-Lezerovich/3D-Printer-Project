import { io } from 'socket.io-client'
import { useTaskStore } from '../state/task.store'
import type { Task } from '@3d/shared'

const socket = io('/tasks', { autoConnect: true, transports: ['websocket'] })

socket.on('task.created', (task: Task) => useTaskStore.getState().upsertTasks([task]))
socket.on('task.updated', (task: Task) => useTaskStore.getState().upsertTasks([task]))
socket.on('task.deleted', (id: string) => {
  const state = useTaskStore.getState()
  if (!state.tasks[id]) return
  const tasks = { ...state.tasks }
  delete tasks[id]
  const taskIdsByStatus = { ...state.taskIdsByStatus }
  Object.keys(taskIdsByStatus).forEach(status => {
    taskIdsByStatus[status] = taskIdsByStatus[status].filter(tid => tid !== id)
    if (!taskIdsByStatus[status].length) delete taskIdsByStatus[status]
  })
  useTaskStore.setState({ tasks, taskIdsByStatus })
})

export default socket
