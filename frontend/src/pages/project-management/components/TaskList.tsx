import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../shared/store';
import { Task } from '../../../services/project-management-api';

interface TaskListProps {
  showFilters?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ showFilters = true }) => {
  const { 
    tasks, 
    loading, 
    error, 
    filters, 
    setTaskFilters, 
    selectTask, 
    updateTask, 
    deleteTask 
  } = useTaskStore();

  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    setTaskFilters(newFilters);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as 'todo' | 'in-progress' | 'review' | 'done' });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-purple-100 text-purple-800',
    'done': 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="task-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {showFilters && (
        <div className="task-filters">
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={localFilters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={localFilters.assignee || ''}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="filter-select"
          >
            <option value="">All Assignees</option>
            <option value="user1">User 1</option>
            <option value="user2">User 2</option>
          </select>
        </div>
      )}

      <div className="task-grid">
        {tasks.map((task: Task) => (
          <motion.div
            key={task.id}
            className="task-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => selectTask(task)}
          >
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <div className="task-badges">
                <span className={`priority-badge ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                  {task.priority}
                </span>
                <span className={`status-badge ${statusColors[task.status as keyof typeof statusColors]}`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <p className="task-description">{task.description}</p>

            <div className="task-meta">
              <div className="task-assignee">
                <span>👤 {task.assignee || 'Unassigned'}</span>
              </div>
              <div className="task-dates">
                {task.dueDate && (
                  <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <div className="task-actions">
              <select
                value={task.status}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, e.target.value);
                }}
                className="status-selector"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="delete-btn"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
