import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsStore, useTaskStore, useBudgetStore, useInventoryStore } from '../shared/store';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    loading: analyticsLoading, 
    error: analyticsError,
    fetchAnalytics 
  } = useAnalyticsStore();

  const { tasks, loading: tasksLoading } = useTaskStore();
  const { categories, expenses, loading: budgetLoading } = useBudgetStore();
  const { items, loading: inventoryLoading } = useInventoryStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const isLoading = analyticsLoading || tasksLoading || budgetLoading || inventoryLoading;

  // Calculate real-time metrics from current data
  const calculateMetrics = () => {
    // Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'done';
    }).length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Budget metrics
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Inventory metrics
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.currentQuantity <= item.minimumQuantity).length;
    const outOfStockItems = items.filter(item => item.currentQuantity === 0).length;
    const totalInventoryValue = items.reduce((sum, item) => {
      return sum + (item.currentQuantity * (item.unitCost || 0));
    }, 0);

    // Performance indicators
    const getTaskTrend = () => {
      const recentTasks = tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= weekAgo;
      });
      return recentTasks.length;
    };

    const getBudgetHealth = () => {
      if (budgetUtilization <= 70) return 'healthy';
      if (budgetUtilization <= 90) return 'warning';
      return 'critical';
    };

    const getInventoryHealth = () => {
      const healthyItems = items.length - lowStockItems - outOfStockItems;
      const healthPercentage = items.length > 0 ? (healthyItems / items.length) * 100 : 100;
      if (healthPercentage >= 80) return 'healthy';
      if (healthPercentage >= 60) return 'warning';
      return 'critical';
    };

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate: taskCompletionRate,
        weeklyTrend: getTaskTrend()
      },
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining: remainingBudget,
        utilization: budgetUtilization,
        health: getBudgetHealth()
      },
      inventory: {
        total: totalItems,
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        totalValue: totalInventoryValue,
        health: getInventoryHealth()
      }
    };
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="analytics-error">
        <p>Error: {analyticsError}</p>
        <button onClick={fetchAnalytics}>Retry</button>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="analytics-dashboard">
      {/* Executive Summary */}
      <section className="executive-summary">
        <h2 className="section-title">Project Dashboard</h2>
        <div className="summary-grid">
          <motion.div 
            className="summary-card project-health"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header">
              <h3>Project Health</h3>
              <div className={`health-indicator ${
                metrics.budget.health === 'healthy' && 
                metrics.inventory.health === 'healthy' && 
                metrics.tasks.completionRate > 70 ? 'healthy' : 
                'warning'
              }`}></div>
            </div>
            <div className="health-details">
              <div className="health-item">
                <span className="label">Tasks</span>
                <span className={`value ${metrics.tasks.completionRate > 70 ? 'good' : 'needs-attention'}`}>
                  {metrics.tasks.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="health-item">
                <span className="label">Budget</span>
                <span className={`value ${metrics.budget.health === 'healthy' ? 'good' : metrics.budget.health}`}>
                  {metrics.budget.utilization.toFixed(1)}%
                </span>
              </div>
              <div className="health-item">
                <span className="label">Inventory</span>
                <span className={`value ${metrics.inventory.health}`}>
                  {metrics.inventory.health}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="summary-card quick-stats"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Quick Stats</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-value">{metrics.tasks.total}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">${metrics.budget.total.toLocaleString()}</span>
                <span className="stat-label">Total Budget</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{metrics.inventory.total}</span>
                <span className="stat-label">Inventory Items</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="summary-card alerts"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Alerts</h3>
            <div className="alerts-list">
              {metrics.tasks.overdue > 0 && (
                <div className="alert-item critical">
                  <span className="alert-icon">⚠️</span>
                  <span>{metrics.tasks.overdue} overdue tasks</span>
                </div>
              )}
              {metrics.inventory.outOfStock > 0 && (
                <div className="alert-item critical">
                  <span className="alert-icon">📦</span>
                  <span>{metrics.inventory.outOfStock} out of stock items</span>
                </div>
              )}
              {metrics.budget.utilization > 90 && (
                <div className="alert-item warning">
                  <span className="alert-icon">💰</span>
                  <span>Budget utilization at {metrics.budget.utilization.toFixed(1)}%</span>
                </div>
              )}
              {metrics.inventory.lowStock > 0 && (
                <div className="alert-item warning">
                  <span className="alert-icon">📉</span>
                  <span>{metrics.inventory.lowStock} low stock items</span>
                </div>
              )}
              {metrics.tasks.overdue === 0 && metrics.inventory.outOfStock === 0 && 
               metrics.budget.utilization <= 90 && metrics.inventory.lowStock === 0 && (
                <div className="alert-item success">
                  <span className="alert-icon">✅</span>
                  <span>All systems operating normally</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Analytics */}
      <section className="detailed-analytics">
        <div className="analytics-grid">
          {/* Task Analytics */}
          <motion.div 
            className="analytics-card task-analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Task Performance</h3>
            <div className="analytics-content">
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Completion Rate</span>
                  <span className="metric-value">{metrics.tasks.completionRate.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${metrics.tasks.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span>Completed: {metrics.tasks.completed}</span>
                </div>
                <div className="detail-item">
                  <span>In Progress: {metrics.tasks.total - metrics.tasks.completed}</span>
                </div>
                <div className="detail-item">
                  <span>This Week: +{metrics.tasks.weeklyTrend}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Budget Analytics */}
          <motion.div 
            className="analytics-card budget-analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Budget Analysis</h3>
            <div className="analytics-content">
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Utilization</span>
                  <span className={`metric-value ${metrics.budget.health}`}>
                    {metrics.budget.utilization.toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${metrics.budget.health}`}
                    style={{ width: `${Math.min(metrics.budget.utilization, 100)}%` }}
                  />
                </div>
              </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span>Spent: ${metrics.budget.spent.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span>Remaining: ${metrics.budget.remaining.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span>Categories: {categories.length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inventory Analytics */}
          <motion.div 
            className="analytics-card inventory-analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Inventory Status</h3>
            <div className="analytics-content">
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Health Status</span>
                  <span className={`metric-value ${metrics.inventory.health}`}>
                    {metrics.inventory.health}
                  </span>
                </div>
              </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span>Total Value: ${metrics.inventory.totalValue.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span>Low Stock: {metrics.inventory.lowStock} items</span>
                </div>
                <div className="detail-item">
                  <span>Out of Stock: {metrics.inventory.outOfStock} items</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trends and Insights */}
      <section className="trends-insights">
        <h3>Insights & Recommendations</h3>
        <div className="insights-grid">
          <motion.div 
            className="insight-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Task Performance</h4>
              <p>
                {metrics.tasks.completionRate > 80 ? 
                  "Great job! Your task completion rate is excellent." :
                  metrics.tasks.completionRate > 60 ?
                  "Task completion is on track. Consider prioritizing overdue items." :
                  "Focus needed on task completion. Review workflow and priorities."
                }
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="insight-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>Budget Management</h4>
              <p>
                {metrics.budget.health === 'healthy' ? 
                  "Budget is well-managed with healthy utilization." :
                  metrics.budget.health === 'warning' ?
                  "Budget utilization is approaching limits. Monitor spending closely." :
                  "Budget is over-utilized. Immediate attention required."
                }
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="insight-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="insight-icon">📦</div>
            <div className="insight-content">
              <h4>Inventory Health</h4>
              <p>
                {metrics.inventory.lowStock + metrics.inventory.outOfStock === 0 ?
                  "Inventory levels are optimal with good stock management." :
                  `${metrics.inventory.lowStock + metrics.inventory.outOfStock} items need attention. Consider reordering soon.`
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
