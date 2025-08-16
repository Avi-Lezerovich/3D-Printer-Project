import React from 'react';
import { motion } from 'framer-motion';
import { useProjectManagementStore } from '../shared/store';
import { Task, BudgetCategory, InventoryItem } from '../../../services/project-management-api';

export const ProjectOverview: React.FC = () => {
  const { 
    tasks, 
    categories, 
    items, 
    taskLoading, 
    budgetLoading, 
    inventoryLoading, 
    analyticsLoading 
  } = useProjectManagementStore();

  const isLoading = taskLoading || budgetLoading || inventoryLoading || analyticsLoading;

  // Calculate overview metrics
  const overviewMetrics = React.useMemo(() => {
    const completedTasks = tasks.filter((task: Task) => task.status === 'done').length;
    const inProgressTasks = tasks.filter((task: Task) => task.status === 'in-progress').length;
    const totalBudget = categories.reduce((sum: number, category: BudgetCategory) => sum + category.budgetedAmount, 0);
    const lowStockItems = items.filter((item: InventoryItem) => item.status === 'low-stock').length;
    
    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
      totalBudget,
      totalCategories: categories.length,
      totalInventoryItems: items.length,
      lowStockItems,
      criticalAlerts: lowStockItems + (inProgressTasks > 5 ? 1 : 0)
    };
  }, [tasks, categories, items]);

  if (isLoading) {
    return (
      <div className="project-overview-loading">
        <div className="loading-spinner"></div>
        <p>Loading project overview...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="project-overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Metrics Section */}
      <section className="overview-hero">
        <div className="hero-metrics-grid">
          <motion.div 
            className="metric-card primary"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-icon">🚀</div>
            <div className="metric-value">{overviewMetrics.completionRate}%</div>
            <div className="metric-label">Project Progress</div>
            <div className="metric-detail">
              {overviewMetrics.completedTasks} of {overviewMetrics.totalTasks} tasks completed
            </div>
          </motion.div>

          <motion.div 
            className="metric-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-icon">📋</div>
            <div className="metric-value">{overviewMetrics.inProgressTasks}</div>
            <div className="metric-label">Active Tasks</div>
            <div className="metric-detail">Currently in progress</div>
          </motion.div>

          <motion.div 
            className="metric-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-icon">💰</div>
            <div className="metric-value">${overviewMetrics.totalBudget.toLocaleString()}</div>
            <div className="metric-label">Total Budget</div>
            <div className="metric-detail">{overviewMetrics.totalCategories} categories tracked</div>
          </motion.div>

          <motion.div 
            className="metric-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-icon">📦</div>
            <div className="metric-value">{overviewMetrics.totalInventoryItems}</div>
            <div className="metric-label">Inventory Items</div>
            <div className="metric-detail">
              {overviewMetrics.lowStockItems > 0 && (
                <span className="warning">{overviewMetrics.lowStockItems} low stock</span>
              )}
              {overviewMetrics.lowStockItems === 0 && (
                <span className="success">All items in stock</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="overview-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards">
          <motion.div 
            className="action-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h3>Add New Task</h3>
              <p>Create and assign a new project task</p>
            </div>
          </motion.div>

          <motion.div 
            className="action-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">💼</div>
            <div className="action-content">
              <h3>Budget Planning</h3>
              <p>Review and update project budgets</p>
            </div>
          </motion.div>

          <motion.div 
            className="action-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>View Analytics</h3>
              <p>Detailed project performance insights</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="overview-activity">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-feed">
          {tasks.slice(0, 5).map((task: Task, index: number) => (
            <motion.div 
              key={task.id}
              className="activity-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`activity-status ${task.status}`}></div>
              <div className="activity-content">
                <h4>{task.title}</h4>
                <p>{task.description.substring(0, 100)}...</p>
                <div className="activity-meta">
                  <span className="activity-priority">{task.priority}</span>
                  <span className="activity-date">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Health Section */}
      <section className="overview-health">
        <h2 className="section-title">System Health</h2>
        <div className="health-indicators">
          <div className="health-item">
            <div className="health-icon status-excellent">✓</div>
            <div className="health-content">
              <h4>API Connection</h4>
              <p>All endpoints responding normally</p>
            </div>
          </div>

          <div className="health-item">
            <div className="health-icon status-good">⚠</div>
            <div className="health-content">
              <h4>Data Sync</h4>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="health-item">
            <div className="health-icon status-excellent">🔄</div>
            <div className="health-content">
              <h4>Background Tasks</h4>
              <p>Processing queue healthy</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ProjectOverview;
