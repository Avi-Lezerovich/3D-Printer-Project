import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  SortableItem,
} from './SortableItem'
import { useAppStore } from '../shared/store'

interface DroppableColumnProps {
  id: string
  title: string
  children: React.ReactNode
}

function DroppableColumn({ id, title, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div 
      ref={setNodeRef}
      className="panel" 
      style={{
        minHeight: 400,
        backgroundColor: isOver ? 'rgba(18, 58, 86, 0.5)' : undefined,
        border: isOver ? '2px dashed #37d67a' : '1px solid rgba(18, 58, 86, 0.3)',
        transition: 'all 0.2s ease'
      }}
    >
      <h2 style={{marginBottom: 16, color: isOver ? '#37d67a' : undefined}}>{title}</h2>
      {children}
    </div>
  )
}

// type Task = { id: string; title: string; }

export default function KanbanBoard() {
  const tasks = useAppStore(s=>s.tasks)
  const moveTask = useAppStore(s=>s.moveTask)
  const addTask = useAppStore(s=>s.addTask)
  
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = useMemo<Array<{id: 'todo'|'doing'|'done', title: string}>>(()=> ([
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'In Progress' },
    { id: 'done', title: 'Complete' }
  ]), [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return
    
    const taskId = parseInt(active.id as string)
    const overContainer = over.id as string
    
  // Debug: drag completed; replace console.log with info-level logging or remove in production
  // console.info('Drag end:', { taskId, overContainer })
    
    // If dropped on a column, move task to that column
    if (columns.some(col => col.id === overContainer)) {
  // console.info('Moving task:', taskId, 'to', overContainer)
      moveTask(taskId, overContainer as 'todo'|'doing'|'done')
    }
  }, [moveTask, columns])

  const activeTask = activeId ? tasks.find(t => t.id.toString() === activeId) : null

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), 'med')
      setNewTaskTitle('')
    }
  }

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, height: '100%'}}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.id)
          
          return (
            <DroppableColumn key={column.id} id={column.id} title={column.title}>
              <SortableContext items={columnTasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200}}>
                  {columnTasks.map(task => (
                    <SortableItem key={task.id} id={task.id.toString()} task={task} />
                  ))}
                </div>
              </SortableContext>
              
              {column.id === 'todo' && (
                <form onSubmit={handleAddTask} style={{marginTop: 12}}>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add new task..."
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #123a56',
                      borderRadius: 6,
                      background: '#0d1d2b',
                      color: '#e6f1ff'
                    }}
                  />
                  <button 
                    type="submit" 
                    className="panel" 
                    style={{marginTop: 8, width: '100%'}}
                    disabled={!newTaskTitle.trim()}
                  >
                    Add Task
                  </button>
                </form>
              )}
            </DroppableColumn>
          )
        })}
        
        <DragOverlay>
          {activeTask ? (
            <div className="panel" style={{background: '#09121a', opacity: 0.8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span>{activeTask.title}</span>
                <small style={{color:'var(--muted)'}}>{activeTask.priority}</small>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
