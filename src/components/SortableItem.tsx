import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Task = { id:number; title:string; status:'todo'|'doing'|'done'; priority:'low'|'med'|'high' }

interface SortableItemProps {
  id: string
  task: Task
}

export function SortableItem({ id, task }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColor = {
    high: '#f44336',
    med: '#f5a623', 
    low: '#37d67a'
  }[task.priority]

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="panel"
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}, Priority: ${task.priority}`}
      style={{
        ...style,
        background: '#09121a',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        borderLeft: `4px solid ${priorityColor}`
      }}
    >
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span>{task.title}</span>
        <small style={{color:'var(--muted)'}}>{task.priority}</small>
      </div>
    </div>
  )
}
