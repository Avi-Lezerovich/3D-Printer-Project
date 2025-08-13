import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from '../../components/KanbanBoard';
import { useAppStore } from '../../shared/store';

export default function TaskManagement() {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const editTask = useAppStore((s) => s.editTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), taskPriority);
      setNewTaskTitle('');
      setNewTaskDescription('');
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

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const getPriorityColor = (priority: 'low' | 'med' | 'high') => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'med': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="task-management-container"
    >
      <div className="task-management-header">
        <div className="header-main">
          <div className="header-title-section">
            <h2 className="page-title">Task Management</h2>
            <div className="task-stats">
              <div className="stat-item">
                <span className="stat-value">{taskStats.total}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#6b7280' }}>{taskStats.todo}</span>
                <span className="stat-label">To Do</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#3b82f6' }}>{taskStats.doing}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#10b981' }}>{taskStats.done}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban View"
              >
                <span>📋</span>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <span>📝</span>
              </button>
            </div>
            
            <motion.button 
              className="add-task-btn primary"
              onClick={() => setShowAddTask(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-icon">✚</span>
              <span className="btn-text">New Task</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddTask && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddTask(false)}
          >
            <motion.div 
              className="modal-content enhanced"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create New Task</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddTask(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="task-title">Task Title *</label>
                  <input
                    id="task-title"
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-description">Description</label>
                  <textarea
                    id="task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add more details about this task..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <div className="priority-selector">
                    {(['low', 'med', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        className={`priority-btn ${taskPriority === priority ? 'active' : ''}`}
                        onClick={() => setTaskPriority(priority)}
                        style={{
                          '--priority-color': getPriorityColor(priority)
                        } as React.CSSProperties}
                      >
                        <span className="priority-dot"></span>
                        <span className="priority-text">
                          {priority === 'low' ? 'Low' : priority === 'med' ? 'Medium' : 'High'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  onClick={() => setShowAddTask(false)} 
                  className="btn secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTask} 
                  className="btn primary"
                  disabled={!newTaskTitle.trim()}
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="task-content">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="kanban-view"
            >
              <KanbanBoard />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="list-view"
            >
              <div className="task-list-container">
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No tasks yet</h3>
                    <p>Create your first task to get started with project management</p>
                    <button 
                      className="btn primary"
                      onClick={() => setShowAddTask(true)}
                    >
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="task-groups">
                    {(['todo', 'doing', 'done'] as const).map((status) => (
                      <div key={status} className="task-group">
                        <h3 className="group-title">
                          <span className="group-icon">
                            {status === 'todo' ? '📋' : status === 'doing' ? '🔄' : '✅'}
                          </span>
                          {status === 'todo' ? 'To Do' : status === 'doing' ? 'In Progress' : 'Completed'}
                          <span className="task-count">
                            {tasks.filter(t => t.status === status).length}
                          </span>
                        </h3>
                        <div className="task-items">
                          {tasks
                            .filter(t => t.status === status)
                            .map((task, index) => (
                              <motion.div
                                key={task.id}
                                className={`task-item ${task.priority}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <div className="task-content">
                                  <div className="task-header">
                                    <span className="task-title">{task.title}</span>
                                    <div className="task-actions">
                                      <button
                                        className="action-btn edit"
                                        onClick={() => handleEditTask(task.id)}
                                        title="Edit task"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="action-btn delete"
                                        onClick={() => deleteTask(task.id)}
                                        title="Delete task"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                  <div className="task-meta">
                                    <span 
                                      className={`priority-badge ${task.priority}`}
                                      style={{
                                        '--priority-color': getPriorityColor(task.priority)
                                      } as React.CSSProperties}
                                    >
                                      {task.priority === 'low' ? 'Low' : task.priority === 'med' ? 'Medium' : 'High'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingTask !== null && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelEdit}
          >
            <motion.div 
              className="modal-content enhanced"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Task</h3>
                <button 
                  className="close-btn"
                  onClick={handleCancelEdit}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-task-title">Task Title *</label>
                  <input
                    id="edit-task-title"
                    type="text"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-task-priority">Priority</label>
                  <div className="priority-selector">
                    {(['low', 'med', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        className={`priority-btn ${editTaskPriority === priority ? 'active' : ''}`}
                        onClick={() => setEditTaskPriority(priority)}
                        style={{
                          '--priority-color': getPriorityColor(priority)
                        } as React.CSSProperties}
                      >
                        <span className="priority-dot"></span>
                        <span className="priority-text">
                          {priority === 'low' ? 'Low' : priority === 'med' ? 'Medium' : 'High'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={handleCancelEdit} className="btn secondary">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="btn primary"
                  disabled={!editTaskTitle.trim()}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
