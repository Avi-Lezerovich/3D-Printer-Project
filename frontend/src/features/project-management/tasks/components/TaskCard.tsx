/**
 * TaskCard Component
 * A focused, reusable card component for displaying individual tasks
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../shared/types';
import { formatDate, isOverdue, getDaysUntilDue, getStatusColorClass } from '../../shared/utils';
import { getStatusConfig, getPriorityConfig } from '../../shared/utils';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const taskIsOverdue = isOverdue(task.dueDate);

  const handleCardClick = () => {
    onClick?.(task);
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: Task['status']) => {
    e.stopPropagation();
    onStatusChange?.(task.id, newStatus);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  return (
    <motion.div
      className={`pm-card interactive ${compact ? 'compact' : ''} ${className}`}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: 'var(--pm-shadow-lg)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header */}
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">
            {task.title}
          </h3>
          <div className="task-badges">
            <span className={`pm-badge ${getStatusColorClass(task.status)}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span className={`pm-badge ${getStatusColorClass(task.priority)}`}>
              {priorityConfig.icon} {priorityConfig.label}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="task-actions">
            <button
              className="action-btn edit-btn"
              onClick={handleEditClick}
              title="Edit task"
              aria-label="Edit task"
            >
              ✏️
            </button>
            <button
              className="action-btn delete-btn"
              onClick={handleDeleteClick}
              title="Delete task"
              aria-label="Delete task"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="pm-card-content">
        {!compact && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        {/* Task Metadata */}
        <div className="task-metadata">
          {task.assignee && (
            <div className="metadata-item">
              <span className="metadata-icon">👤</span>
              <span className="metadata-text">{task.assignee}</span>
            </div>
          )}

          {task.dueDate && (
            <div className={`metadata-item due-date ${taskIsOverdue ? 'overdue' : ''}`}>
              <span className="metadata-icon">📅</span>
              <span className="metadata-text">
                {formatDate(task.dueDate, 'MEDIUM')}
                {daysUntilDue !== null && (
                  <span className="days-until-due">
                    {daysUntilDue === 0 ? ' (Today)' :
                     daysUntilDue > 0 ? ` (${daysUntilDue}d left)` :
                     ` (${Math.abs(daysUntilDue)}d overdue)`}
                  </span>
                )}
              </span>
            </div>
          )}

          {task.estimatedHours && (
            <div className="metadata-item">
              <span className="metadata-icon">⏱️</span>
              <span className="metadata-text">
                {task.estimatedHours}h estimated
              </span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="metadata-item tags">
              <span className="metadata-icon">🏷️</span>
              <div className="tag-list">
                {task.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Status Change */}
        {showActions && task.status !== 'done' && (
          <div className="quick-actions">
            {task.status === 'todo' && (
              <button
                className="pm-btn pm-btn-sm pm-btn-primary"
                onClick={(e) => handleStatusClick(e, 'in-progress')}
              >
                Start Task
              </button>
            )}
            {task.status === 'in-progress' && (
              <button
                className="pm-btn pm-btn-sm pm-btn-warning"
                onClick={(e) => handleStatusClick(e, 'review')}
              >
                Ready for Review
              </button>
            )}
            {task.status === 'review' && (
              <button
                className="pm-btn pm-btn-sm pm-btn-success"
                onClick={(e) => handleStatusClick(e, 'done')}
              >
                Complete Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="task-progress-indicator">
        <div 
          className={`progress-bar ${task.status}`}
          style={{
            width: task.status === 'todo' ? '10%' :
                   task.status === 'in-progress' ? '50%' :
                   task.status === 'review' ? '80%' : '100%'
          }}
        />
      </div>
    </motion.div>
  );
};
