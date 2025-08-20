/**
 * Tasks View Component
 * Professional task management interface with CRUD operations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design 3D Print Cooling System',
    description: 'Create and optimize the cooling fan assembly for better print quality and temperature management.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2025-01-15',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-05',
    tags: ['hardware', 'design', 'cooling']
  },
  {
    id: '2',
    title: 'Implement Print Queue Management',
    description: 'Develop software interface for managing multiple print jobs and queue scheduling.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2025-01-20',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
    tags: ['software', 'ui', 'queue']
  },
  {
    id: '3',
    title: 'Calibrate Print Bed Leveling',
    description: 'Fine-tune automatic bed leveling system for consistent first layer quality.',
    status: 'done',
    priority: 'high',
    assignee: 'Mike Johnson',
    dueDate: '2025-01-10',
    createdAt: '2024-12-28',
    updatedAt: '2025-01-08',
    tags: ['calibration', 'mechanical', 'quality']
  },
  {
    id: '4',
    title: 'Update Firmware to Latest Version',
    description: 'Upgrade printer firmware to include new safety features and performance improvements.',
    status: 'review',
    priority: 'medium',
    assignee: 'Sarah Wilson',
    dueDate: '2025-01-25',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-07',
    tags: ['firmware', 'upgrade', 'safety']
  },
  {
    id: '5',
    title: 'Test New Filament Materials',
    description: 'Evaluate performance of new PLA+ and PETG filaments with different print settings.',
    status: 'in-progress',
    priority: 'low',
    assignee: 'Alex Chen',
    dueDate: '2025-01-30',
    createdAt: '2025-01-04',
    updatedAt: '2025-01-09',
    tags: ['materials', 'testing', 'quality']
  }
];

const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }> = ({ 
  task, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'pm-badge-gray';
      case 'in-progress': return 'pm-badge-info';
      case 'review': return 'pm-badge-warning';
      case 'done': return 'pm-badge-success';
      default: return 'pm-badge-gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'pm-text-muted';
      case 'medium': return 'pm-text-warning';
      case 'high': return 'pm-text-danger';
      case 'urgent': return 'pm-text-danger';
      default: return 'pm-text-muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return (
    <motion.div
      className="pm-card task-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="task-card-header">
        <div className="task-title-section">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-badges">
            <span className={`pm-badge ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className={`pm-badge pm-badge-gray ${getPriorityColor(task.priority)}`}>
              {task.priority} priority
            </span>
          </div>
        </div>
        <div className="task-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✏️
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-metadata">
        <div className="metadata-item">
          <span className="metadata-icon">👤</span>
          <span className="metadata-text">Assigned to: {task.assignee}</span>
        </div>
        <div className={`metadata-item ${daysUntilDue < 0 ? 'overdue' : ''}`}>
          <span className="metadata-icon">📅</span>
          <span className="metadata-text">
            Due: {formatDate(task.dueDate)}
            {daysUntilDue < 0 && (
              <span className="days-until-due"> ({Math.abs(daysUntilDue)} days overdue)</span>
            )}
            {daysUntilDue >= 0 && (
              <span className="days-until-due"> ({daysUntilDue} days remaining)</span>
            )}
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="tag-list">
          {task.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  const handleEdit = (task: Task) => {
    console.log('Edit task:', task);
    // TODO: Implement edit modal
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const handleAddTask = () => {
    console.log('Add new task');
    // TODO: Implement add task modal
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => {
      const due = new Date(t.dueDate);
      const now = new Date();
      return due < now && t.status !== 'done';
    }).length;

    return { total, completed, inProgress, overdue };
  };

  const stats = getTaskStats();

  return (
    <div className="tasks-view">
      {/* Header */}
      <motion.div 
        className="tasks-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="header-content">
          <h2>✅ Task Management</h2>
          <p>Organize and track your 3D printing project tasks efficiently</p>
        </div>
        
        <div className="header-actions">
          <button className="pm-btn pm-btn-primary" onClick={handleAddTask}>
            ➕ Add Task
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.section 
        className="tasks-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <span className="stat-value">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-value">{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Filters and Controls */}
      <motion.section 
        className="tasks-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="control-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select 
            id="status-filter"
            className="pm-input pm-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Completed</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            className="pm-input pm-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </div>
      </motion.section>

      {/* Tasks Grid */}
      <motion.section 
        className="tasks-grid-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="section-title">Tasks ({sortedTasks.length})</h3>
        
        <div className="tasks-grid">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {sortedTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <span style={{ fontSize: '4rem' }}>📋</span>
            </div>
            <h3>No tasks found</h3>
            <p>
              {filter === 'all' 
                ? "Start by adding your first project task." 
                : `No tasks match the "${filter}" status filter.`}
            </p>
            <button className="pm-btn pm-btn-primary" onClick={handleAddTask}>
              ➕ Add Your First Task
            </button>
          </div>
        )}
      </motion.section>
    </div>
  );
};