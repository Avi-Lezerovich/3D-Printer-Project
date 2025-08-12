import { useState } from 'react';
import { motion } from 'framer-motion';
import KanbanBoard from '../../components/KanbanBoard';
import { useAppStore } from '../../shared/store';

export default function TaskManagement() {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const editTask = useAppStore((s) => s.editTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'med' | 'high'>('med');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), taskPriority);
      setNewTaskTitle('');
      setTaskPriority('med');
      setShowAddTask(false);
    }
  };

  const handleEditTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditTaskTitle(task.title);
      setEditTaskPriority(task.priority);
    }
  };

  const handleSaveEdit = () => {
    if (editingTask !== null && editTaskTitle.trim()) {
      editTask(editingTask, editTaskTitle.trim(), editTaskPriority);
      setEditingTask(null);
      setEditTaskTitle('');
      setEditTaskPriority('med');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTaskTitle('');
    setEditTaskPriority('med');
  };

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="tab-content"
    >
      <div className="task-management-header">
        <div className="header-content">
          <h3>Task Management</h3>
          <div className="task-actions">
            <button 
              className="add-task-btn"
              onClick={() => setShowAddTask(true)}
            >
              <span className="btn-icon">➕</span>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {showAddTask && (
        <motion.div 
          className="add-task-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-content">
            <h4>Add New Task</h4>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task description..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select 
                value={taskPriority} 
                onChange={(e) => setTaskPriority(e.target.value as 'low' | 'med' | 'high')}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddTask} className="primary-btn">Add Task</button>
              <button onClick={() => setShowAddTask(false)} className="secondary-btn">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="kanban-container">
        <KanbanBoard />
      </div>

      {editingTask !== null && (
        <motion.div 
          className="edit-task-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-content">
            <h4>Edit Task</h4>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select 
                value={editTaskPriority} 
                onChange={(e) => setEditTaskPriority(e.target.value as 'low' | 'med' | 'high')}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="primary-btn">Save Changes</button>
              <button onClick={handleCancelEdit} className="secondary-btn">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
