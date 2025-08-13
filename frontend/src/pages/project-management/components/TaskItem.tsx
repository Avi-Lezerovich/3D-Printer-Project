import { motion } from 'framer-motion';
import { useAppStore, Task } from '../../../shared/store';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { editTask, deleteTask } = useAppStore();

  const getPriorityColor = (priority: 'low' | 'med' | 'high') => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'med':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <motion.div
      className="task-item"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="task-info">
        <span className="task-title">{task.title}</span>
        <span className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </span>
      </div>
      <div className="task-actions">
        <button onClick={() => editTask(task.id, task.title, task.priority)}>Edit</button>
        <button onClick={() => deleteTask(task.id)}>Delete</button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
