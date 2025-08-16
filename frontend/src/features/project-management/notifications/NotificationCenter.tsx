/**
 * Notification Center
 * Centralized notification and alert management system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  source: 'system' | 'task' | 'budget' | 'inventory' | 'quality' | 'user';
  actionable?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: 'budget_alert' | 'task_overdue' | 'inventory_low' | 'test_failure' | 'milestone_due';
  enabled: boolean;
  threshold?: number;
  channels: ('desktop' | 'email' | 'in-app')[];
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Low Inventory Alert',
    message: 'PLA Filament stock is below minimum threshold (1.2kg remaining, minimum: 2.0kg)',
    type: 'warning',
    priority: 'high',
    timestamp: '2025-01-16T10:30:00Z',
    read: false,
    source: 'inventory',
    actionable: true,
    actions: [
      {
        id: 'reorder',
        label: 'Reorder Now',
        type: 'primary',
        action: () => console.log('Reordering filament')
      },
      {
        id: 'snooze',
        label: 'Snooze 1 Day',
        type: 'secondary',
        action: () => console.log('Snoozing notification')
      }
    ]
  },
  {
    id: 'notif-2',
    title: 'Test Failure',
    message: '24-Hour Stress Test failed: Print head calibration drift detected after 18 hours',
    type: 'error',
    priority: 'critical',
    timestamp: '2025-01-15T16:45:00Z',
    read: false,
    source: 'quality'
  },
  {
    id: 'notif-3',
    title: 'Milestone Approaching',
    message: 'Documentation Complete milestone is due in 3 days',
    type: 'reminder',
    priority: 'medium',
    timestamp: '2025-01-15T09:00:00Z',
    read: true,
    source: 'task'
  },
  {
    id: 'notif-4',
    title: 'Budget Alert',
    message: 'Project spending has reached 85% of allocated budget ($247.50 of $300.00)',
    type: 'warning',
    priority: 'medium',
    timestamp: '2025-01-14T14:20:00Z',
    read: true,
    source: 'budget'
  },
  {
    id: 'notif-5',
    title: 'Print Quality Test Passed',
    message: 'Print Quality Assessment completed successfully with 95% accuracy',
    type: 'success',
    priority: 'low',
    timestamp: '2025-01-14T11:15:00Z',
    read: true,
    source: 'quality'
  }
];

const NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'budget-alert',
    name: 'Budget Alerts',
    description: 'Notify when spending reaches threshold percentage',
    type: 'budget_alert',
    enabled: true,
    threshold: 80,
    channels: ['desktop', 'in-app']
  },
  {
    id: 'task-overdue',
    name: 'Overdue Tasks',
    description: 'Alert when tasks exceed their due date',
    type: 'task_overdue',
    enabled: true,
    channels: ['desktop', 'email', 'in-app']
  },
  {
    id: 'inventory-low',
    name: 'Low Stock Alerts',
    description: 'Notify when inventory falls below minimum levels',
    type: 'inventory_low',
    enabled: true,
    channels: ['desktop', 'in-app']
  },
  {
    id: 'test-failure',
    name: 'Quality Test Failures',
    description: 'Immediate notification for failed quality tests',
    type: 'test_failure',
    enabled: true,
    channels: ['desktop', 'email', 'in-app']
  },
  {
    id: 'milestone-due',
    name: 'Upcoming Milestones',
    description: 'Reminder for approaching milestone deadlines',
    type: 'milestone_due',
    enabled: true,
    threshold: 3, // days before
    channels: ['in-app']
  }
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [rules, setRules] = useState<NotificationRule[]>(NOTIFICATION_RULES);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [view, setView] = useState<'notifications' | 'settings'>('notifications');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'reminder':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'system':
        return '⚙️';
      case 'task':
        return '✅';
      case 'budget':
        return '💰';
      case 'inventory':
        return '📦';
      case 'quality':
        return '🎯';
      case 'user':
        return '👤';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'var(--pm-danger-600)';
      case 'high':
        return 'var(--pm-danger-500)';
      case 'medium':
        return 'var(--pm-warning-500)';
      case 'low':
        return 'var(--pm-success-500)';
      default:
        return 'var(--pm-gray-400)';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'actionable':
        return notif.actionable;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionableCount = notifications.filter(n => n.actionable).length;

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new notification (for demo purposes)
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          title: 'System Update',
          message: 'A new system update is available',
          type: 'info',
          priority: 'low',
          timestamp: new Date().toISOString(),
          read: false,
          source: 'system'
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="notification-header">
        <div className="header-left">
          <h2>🔔 Notification Center</h2>
          <p>Stay updated with alerts, reminders, and system notifications</p>
        </div>
        
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={view === 'notifications' ? 'active' : ''}
              onClick={() => setView('notifications')}
            >
              Notifications ({notifications.length})
            </button>
            <button 
              className={view === 'settings' ? 'active' : ''}
              onClick={() => setView('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon">📬</div>
          <div className="stat-content">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <span className="stat-value">{actionableCount}</span>
            <span className="stat-label">Actionable</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏃</div>
          <div className="stat-content">
            <span className="stat-value">{notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="notification-content">
        {view === 'notifications' && (
          <>
            {/* Filters and Actions */}
            <div className="notification-controls">
              <div className="filter-buttons">
                <button 
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button 
                  className={filter === 'unread' ? 'active' : ''}
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
                <button 
                  className={filter === 'actionable' ? 'active' : ''}
                  onClick={() => setFilter('actionable')}
                >
                  Actionable ({actionableCount})
                </button>
              </div>
              
              <div className="action-buttons">
                <button onClick={markAllAsRead} disabled={unreadCount === 0}>
                  Mark All Read
                </button>
                <button>Clear All</button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.priority}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      setSelectedNotification(notification);
                    }}
                  >
                    <div className="notification-indicator">
                      <div 
                        className="priority-bar"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                      {!notification.read && <div className="unread-dot" />}
                    </div>
                    
                    <div className="notification-icon">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{notification.title}</h4>
                        <div className="notification-meta">
                          <span className="notification-source">
                            {getSourceIcon(notification.source)}
                          </span>
                          <span className="notification-time">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="notification-message">{notification.message}</p>
                      
                      {notification.actionable && notification.actions && (
                        <div className="notification-actions">
                          {notification.actions.map(action => (
                            <button
                              key={action.id}
                              className={`action-btn ${action.type}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="delete-notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredNotifications.length === 0 && (
                <div className="no-notifications">
                  <div className="empty-icon">📭</div>
                  <h3>No notifications</h3>
                  <p>
                    {filter === 'unread' && 'All caught up! No unread notifications.'}
                    {filter === 'actionable' && 'No actionable notifications at the moment.'}
                    {filter === 'all' && 'Your notification center is empty.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'settings' && (
          <div className="notification-settings">
            <div className="settings-header">
              <h3>Notification Rules</h3>
              <p>Configure when and how you receive notifications</p>
            </div>
            
            <div className="rules-list">
              {rules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  className={`rule-item ${rule.enabled ? 'enabled' : 'disabled'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="rule-content">
                    <div className="rule-header">
                      <h4>{rule.name}</h4>
                      <div className="rule-toggle">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleRule(rule.id)}
                          id={`rule-${rule.id}`}
                        />
                        <label htmlFor={`rule-${rule.id}`} />
                      </div>
                    </div>
                    
                    <p className="rule-description">{rule.description}</p>
                    
                    {rule.threshold && (
                      <div className="rule-threshold">
                        Threshold: {rule.threshold}
                        {rule.type === 'budget_alert' && '%'}
                        {rule.type === 'milestone_due' && ' days'}
                      </div>
                    )}
                    
                    <div className="rule-channels">
                      <span>Channels: </span>
                      {rule.channels.map(channel => (
                        <span key={channel} className="channel-badge">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            className="notification-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              className="notification-detail-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="header-left">
                  <div className="notification-type-icon">
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <h3>{selectedNotification.title}</h3>
                    <div className="modal-meta">
                      <span className={`priority-badge ${selectedNotification.priority}`}>
                        {selectedNotification.priority}
                      </span>
                      <span>From {selectedNotification.source}</span>
                      <span>{formatTimestamp(selectedNotification.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedNotification(null)}>✕</button>
              </div>
              
              <div className="modal-content">
                <div className="notification-message">
                  {selectedNotification.message}
                </div>
                
                {selectedNotification.actions && (
                  <div className="modal-actions">
                    {selectedNotification.actions.map(action => (
                      <button
                        key={action.id}
                        className={`btn-${action.type}`}
                        onClick={action.action}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
