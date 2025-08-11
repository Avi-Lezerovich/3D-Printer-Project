import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from '../components/KanbanBoard';
import { useAppStore } from '../shared/store';
import '../styles/project-management.css';

interface ProjectMetric {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  icon: string;
  color: string;
  description: string;
}

interface BudgetItem {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
}

interface InventoryItem {
  name: string;
  current: number | string;
  minimum: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export default function ProjectManagement() {
  const tasks = useAppStore((s) => s.tasks);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'inventory' | 'timeline'>('overview');
  const [animatedStats, setAnimatedStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const totalTasks = tasks.length;
  const doingTasks = tasks.filter((t) => t.status === 'doing').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const metrics: ProjectMetric[] = [
    {
      id: 'tasks',
      title: 'Active Tasks',
      value: doingTasks,
      change: +12,
      icon: '🚀',
      color: '#00aef0',
      description: 'Tasks currently in progress'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: doneTasks,
      change: +25,
      icon: '✅',
      color: '#37d67a',
      description: 'Successfully completed tasks'
    },
    {
      id: 'progress',
      title: 'Progress',
      value: progress,
      unit: '%',
      change: +15,
      icon: '📊',
      color: '#f5a623',
      description: 'Overall project completion'
    },
    {
      id: 'efficiency',
      title: 'Efficiency',
      value: 94,
      unit: '%',
      change: +8,
      icon: '⚡',
      color: '#ff6b6b',
      description: 'Task completion efficiency'
    }
  ];

  const budgetData: BudgetItem[] = [
    { category: 'Hardware', budgeted: 250, spent: 180.32, remaining: 69.68 },
    { category: 'Tools', budgeted: 100, spent: 75.50, remaining: 24.50 },
    { category: 'Materials', budgeted: 50, spent: 32.15, remaining: 17.85 }
  ];

  const inventoryData: InventoryItem[] = [
    { name: 'GT2 Belts', current: '2m', minimum: 0.5, unit: 'm', status: 'good', lastUpdated: '2 days ago' },
    { name: 'Nozzles 0.4mm', current: 3, minimum: 5, unit: 'pcs', status: 'warning', lastUpdated: '1 week ago' },
    { name: 'PLA Filament', current: '1.2kg', minimum: 0.5, unit: 'kg', status: 'good', lastUpdated: '3 days ago' },
    { name: 'Stepper Drivers', current: 0, minimum: 2, unit: 'pcs', status: 'critical', lastUpdated: '2 weeks ago' }
  ];

  return (
    <div className="project-management-container">
      {/* Hero Header */}
      <motion.section 
        className="project-hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Project Management Hub
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Comprehensive project tracking, budget management, and resource monitoring for the 3D printer restoration project.
            </motion.p>
          </div>
          <motion.div 
            className="hero-metrics"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="primary-metric">
              <span className="metric-value">{progress}%</span>
              <span className="metric-label">Complete</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Grid */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="stats-grid">
          {metrics.map((metric, index) => (
            <motion.div 
              key={metric.id}
              className="stat-card modern"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
            >
              <div className="stat-header">
                <span className="stat-icon" style={{ color: metric.color }}>
                  {metric.icon}
                </span>
                <div className="stat-change positive">
                  +{metric.change}%
                </div>
              </div>
              <div className="stat-content">
                <motion.div 
                  className="stat-value-wrapper"
                  initial={{ scale: 0 }}
                  animate={{ scale: animatedStats ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <span className="stat-value" style={{ color: metric.color }}>
                    {metric.value}{metric.unit}
                  </span>
                </motion.div>
                <span className="stat-title">{metric.title}</span>
                <span className="stat-description">{metric.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tab Navigation */}
      <motion.section 
        className="tab-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="tab-navigation">
          {[
            { key: 'overview', label: 'Task Overview', icon: '📋' },
            { key: 'budget', label: 'Budget Tracker', icon: '💰' },
            { key: 'inventory', label: 'Inventory', icon: '📦' },
            { key: 'timeline', label: 'Timeline', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <KanbanBoard />
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="budget-overview">
                <h3>Budget Breakdown</h3>
                <div className="budget-cards">
                  {budgetData.map((item) => (
                    <div key={item.category} className="budget-card">
                      <h4>{item.category}</h4>
                      <div className="budget-details">
                        <div className="budget-row">
                          <span>Budgeted</span>
                          <span>${item.budgeted.toFixed(2)}</span>
                        </div>
                        <div className="budget-row">
                          <span>Spent</span>
                          <span className="spent">${item.spent.toFixed(2)}</span>
                        </div>
                        <div className="budget-row">
                          <span>Remaining</span>
                          <span className="remaining">${item.remaining.toFixed(2)}</span>
                        </div>
                        <div className="budget-progress">
                          <div 
                            className="budget-progress-bar"
                            style={{ width: `${(item.spent / item.budgeted) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="inventory-overview">
                <h3>Inventory Status</h3>
                <div className="inventory-grid">
                  {inventoryData.map((item) => (
                    <div key={item.name} className={`inventory-card ${item.status}`}>
                      <div className="inventory-header">
                        <h4>{item.name}</h4>
                        <span className={`status-indicator ${item.status}`}>
                          {item.status === 'good' ? '✅' : item.status === 'warning' ? '⚠️' : '🚨'}
                        </span>
                      </div>
                      <div className="inventory-details">
                        <div className="inventory-amount">
                          <span className="current">{item.current}</span>
                          <span className="unit">{item.unit}</span>
                        </div>
                        <div className="inventory-minimum">
                          Min: {item.minimum} {item.unit}
                        </div>
                        <div className="inventory-updated">
                          Updated: {item.lastUpdated}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="timeline-overview">
                <h3>Project Timeline</h3>
                <div className="timeline-placeholder">
                  <div className="timeline-message">
                    <span className="timeline-icon">🚧</span>
                    <h4>Timeline View Coming Soon</h4>
                    <p>Interactive project timeline with milestones and deadlines will be available in the next update.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
