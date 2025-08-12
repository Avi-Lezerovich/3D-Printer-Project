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
  items: { name: string; cost: number; date: string; }[];
}

interface InventoryItem {
  name: string;
  current: number | string;
  minimum: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
  supplier?: string;
  estimatedCost?: number;
}

interface SkillDemonstration {
  category: string;
  skills: string[];
  level: number; // 1-100
  projects: string[];
}

export default function ProjectManagement() {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const editTask = useAppStore((s) => s.editTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'inventory' | 'analytics'>('overview');
  const [animatedStats, setAnimatedStats] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Enhanced state for improved functionality
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const [showAddBudgetItem, setShowAddBudgetItem] = useState(false);
  const [newBudgetItem, setNewBudgetItem] = useState({ name: '', cost: '', category: 'Hardware' });
  const [showAddInventoryItem, setShowAddInventoryItem] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({ name: '', current: '', minimum: '', unit: 'pcs' });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 500);
    
    // Initialize data arrays
    setBudgetItems([
      { 
        category: 'Hardware', 
        budgeted: 250, 
        spent: 180.32, 
        remaining: 69.68,
        items: [
          { name: 'Stepper Motors', cost: 45.00, date: '2025-07-15' },
          { name: 'Motherboard', cost: 89.99, date: '2025-07-20' },
          { name: 'Hot End', cost: 45.33, date: '2025-08-02' }
        ]
      },
      { 
        category: 'Tools', 
        budgeted: 100, 
        spent: 75.50, 
        remaining: 24.50,
        items: [
          { name: 'Digital Calipers', cost: 25.99, date: '2025-07-10' },
          { name: 'Hex Keys Set', cost: 15.50, date: '2025-07-12' },
          { name: 'Thermal Paste', cost: 12.99, date: '2025-07-25' },
          { name: 'Multimeter', cost: 21.02, date: '2025-08-01' }
        ]
      },
      { 
        category: 'Materials', 
        budgeted: 50, 
        spent: 32.15, 
        remaining: 17.85,
        items: [
          { name: 'GT2 Belt', cost: 8.50, date: '2025-07-18' },
          { name: 'PLA Filament', cost: 23.65, date: '2025-07-22' }
        ]
      }
    ]);

    setInventoryItems([
      { 
        name: 'GT2 Belts', 
        current: '2m', 
        minimum: 0.5, 
        unit: 'm', 
        status: 'good', 
        lastUpdated: '2 days ago',
        supplier: 'Amazon',
        estimatedCost: 8.50
      },
      { 
        name: 'Nozzles 0.4mm', 
        current: 3, 
        minimum: 5, 
        unit: 'pcs', 
        status: 'warning', 
        lastUpdated: '1 week ago',
        supplier: 'E3D Online',
        estimatedCost: 12.99
      },
      { 
        name: 'PLA Filament', 
        current: '1.2kg', 
        minimum: 0.5, 
        unit: 'kg', 
        status: 'good', 
        lastUpdated: '3 days ago',
        supplier: 'Hatchbox',
        estimatedCost: 25.99
      },
      { 
        name: 'Stepper Drivers', 
        current: 0, 
        minimum: 2, 
        unit: 'pcs', 
        status: 'critical', 
        lastUpdated: '2 weeks ago',
        supplier: 'BIQU',
        estimatedCost: 35.99
      }
    ]);
    
    return () => clearTimeout(timer);
  }, []);

  const totalTasks = tasks.length;
  const doingTasks = tasks.filter((t) => t.status === 'doing').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), taskPriority);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  // Enhanced task management functions
  const handleEditTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditTaskTitle(task.title);
      setEditTaskPriority(task.priority);
    }
  };

  const handleSaveTask = () => {
    if (editingTask !== null && editTaskTitle.trim()) {
      editTask(editingTask, editTaskTitle.trim(), editTaskPriority);
      setEditingTask(null);
      setEditTaskTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTaskTitle('');
  };

  const handleDeleteTask = (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete && window.confirm(`Are you sure you want to delete "${taskToDelete.title}"?`)) {
      deleteTask(taskId);
    }
  };

  // Budget management functions
  const handleAddBudgetItem = () => {
    if (newBudgetItem.name.trim() && newBudgetItem.cost.trim()) {
      const cost = parseFloat(newBudgetItem.cost);
      if (!isNaN(cost)) {
        // In a real app, this would update through state management
        setBudgetItems(prevItems => 
          prevItems.map(category => {
            if (category.category === newBudgetItem.category) {
              return {
                ...category,
                spent: category.spent + cost,
                remaining: category.remaining - cost,
                items: [...category.items, {
                  name: newBudgetItem.name,
                  cost: cost,
                  date: new Date().toISOString().split('T')[0]
                }]
              };
            }
            return category;
          })
        );
        setNewBudgetItem({ name: '', cost: '', category: 'Hardware' });
        setShowAddBudgetItem(false);
      }
    }
  };

  // Inventory management functions
  const handleAddInventoryItem = () => {
    if (newInventoryItem.name.trim() && newInventoryItem.current.trim() && newInventoryItem.minimum.trim()) {
      const current = parseFloat(newInventoryItem.current);
      const minimum = parseFloat(newInventoryItem.minimum);
      if (!isNaN(current) && !isNaN(minimum)) {
        const status: 'good' | 'warning' | 'critical' = 
          current === 0 ? 'critical' : 
          current <= minimum ? 'warning' : 'good';
        
        // In a real app, this would update through state management
        setInventoryItems(prevItems => [...prevItems, {
          name: newInventoryItem.name,
          current: current,
          minimum: minimum,
          unit: newInventoryItem.unit,
          status: status,
          lastUpdated: 'Just now'
        }]);
        
        setNewInventoryItem({ name: '', current: '', minimum: '', unit: 'pcs' });
        setShowAddInventoryItem(false);
      }
    }
  };

  const handleReorderItem = (itemName: string) => {
    // In a real app, this would integrate with supplier APIs
    const confirmOrder = window.confirm(`Initiate reorder for ${itemName}?\n\nThis would normally integrate with supplier APIs to place an actual order.`);
    if (confirmOrder) {
      // Update item status to show order in progress
      setInventoryItems(prevItems => 
        prevItems.map(item => 
          item.name === itemName 
            ? { ...item, lastUpdated: 'Order placed just now' }
            : item
        )
      );
    }
  };

  // Export functionality
  const handleExportData = (type: 'pdf' | 'csv' | 'json') => {
    const data = {
      tasks: tasks,
      budget: budgetData,
      inventory: inventoryData,
      exportDate: new Date().toISOString(),
      projectProgress: progress
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-management-${new Date().toISOString().split('T')[0]}.${type === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      id: 'pending',
      title: 'Pending',
      value: todoTasks,
      change: -8,
      icon: '⏳',
      color: '#ff6b6b',
      description: 'Tasks awaiting attention'
    }
  ];

  const budgetData = budgetItems.length > 0 ? budgetItems : [];

  const inventoryData = inventoryItems.length > 0 ? inventoryItems : [];

  const skillsDemonstrated: SkillDemonstration[] = [
    {
      category: 'Hardware Engineering',
      skills: ['Component Analysis', 'Electronics Troubleshooting', 'Mechanical Assembly', 'Quality Control'],
      level: 85,
      projects: ['3D Printer Restoration', 'Electronics Repair']
    },
    {
      category: 'Software Development',
      skills: ['Firmware Configuration', 'Project Management Systems', 'Web Development', 'Database Management'],
      level: 92,
      projects: ['This Portfolio Website', 'Project Management Hub', 'Control Panel Interface']
    },
    {
      category: 'Problem Solving',
      skills: ['Root Cause Analysis', 'Resource Management', 'Timeline Planning', 'Documentation'],
      level: 88,
      projects: ['Complete Project Lifecycle', 'Budget Management', 'Inventory Control']
    },
    {
      category: 'Project Management',
      skills: ['Agile Methodology', 'Budget Control', 'Resource Planning', 'Risk Assessment'],
      level: 90,
      projects: ['3D Printer Restoration Project', 'Portfolio Development']
    }
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

      {/* Local Project Management Tab Navigation */}
      <motion.section 
        className="project-tabs-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="project-tab-navigation">
          {[
            { key: 'overview', label: 'Task Management', icon: '📋' },
            { key: 'budget', label: 'Budget Tracker', icon: '💰' },
            { key: 'inventory', label: 'Inventory', icon: '📦' },
            { key: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`project-tab-button ${activeTab === tab.key ? 'active' : ''}`}
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
              <div className="task-management-header">
                <div className="header-content">
                  <h3>Task Management</h3>
                  <div className="task-actions">
                    <button 
                      className="add-task-button primary"
                      onClick={() => setShowAddTask(!showAddTask)}
                    >
                      <span className="button-icon">➕</span>
                      Add Task
                    </button>
                    <button 
                      className="export-button"
                      onClick={() => handleExportData('json')}
                      title="Export all data as JSON"
                    >
                      <span className="button-icon">💾</span>
                      Export
                    </button>
                  </div>
                </div>
                
                {showAddTask && (
                  <motion.div 
                    className="add-task-form enhanced"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>Task Title</label>
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Enter task title..."
                          className="task-input"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                          autoFocus
                        />
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={taskPriority}
                          onChange={(e) => setTaskPriority(e.target.value as 'low' | 'med' | 'high')}
                          className="task-select"
                        >
                          <option value="low">Low Priority</option>
                          <option value="med">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleAddTask}
                        disabled={!newTaskTitle.trim()}
                      >
                        Add Task
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setShowAddTask(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Task List with Edit/Delete */}
              <div className="tasks-summary">
                <h4>Task Overview & Management</h4>
                <div className="task-list-enhanced">
                  {tasks.length === 0 ? (
                    <div className="no-tasks">
                      <span className="no-tasks-icon">📝</span>
                      <p>No tasks yet. Create your first task to get started!</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className={`task-item enhanced ${task.status} priority-${task.priority}`}>
                        {editingTask === task.id ? (
                          <div className="edit-task-form">
                            <div className="edit-inputs">
                              <input
                                type="text"
                                value={editTaskTitle}
                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                className="edit-task-input"
                                placeholder="Task title..."
                              />
                              <select
                                value={editTaskPriority}
                                onChange={(e) => setEditTaskPriority(e.target.value as 'low' | 'med' | 'high')}
                                className="edit-task-select"
                              >
                                <option value="low">Low</option>
                                <option value="med">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <div className="edit-actions">
                              <button onClick={handleSaveTask} className="save-edit-button" title="Save changes">💾</button>
                              <button onClick={handleCancelEdit} className="cancel-edit-button" title="Cancel editing">❌</button>
                            </div>
                          </div>
                        ) : (
                          <div className="task-content">
                            <div className="task-info">
                              <h5 className="task-title">{task.title}</h5>
                              <div className="task-meta">
                                <span className={`priority-badge ${task.priority}`}>{task.priority.toUpperCase()}</span>
                                <span className={`status-badge ${task.status}`}>{task.status.toUpperCase()}</span>
                              </div>
                            </div>
                            <div className="task-actions-buttons">
                              <button 
                                onClick={() => handleEditTask(task.id)}
                                className="edit-task-button"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="delete-task-button"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Kanban Board */}
              <div className="kanban-section">
                <h4>Kanban Board</h4>
                <KanbanBoard />
              </div>
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
                <div className="budget-header">
                  <h3>Budget Tracker & Financial Management</h3>
                  <button 
                    className="add-expense-button"
                    onClick={() => setShowAddBudgetItem(!showAddBudgetItem)}
                  >
                    <span className="button-icon">💰</span>
                    Add Expense
                  </button>
                </div>
                
                <div className="showcase-grid">
                  <div className="project-overview-card">
                    <h4>🎯 Project Overview</h4>
                    <p>Complete restoration of a vintage 3D printer, transforming it from a non-functional unit into a high-performance manufacturing tool. This project demonstrates comprehensive engineering skills from hardware troubleshooting to software integration.</p>
                    <div className="project-stats">
                      <div className="stat">
                        <span className="value">4</span>
                        <span className="label">Months Duration</span>
                      </div>
                      <div className="stat">
                        <span className="value">{progress}%</span>
                        <span className="label">Complete</span>
                      </div>
                      <div className="stat">
                        <span className="value">$400</span>
                        <span className="label">Budget</span>
                      </div>
                    </div>
                  </div>

                  <div className="skills-demonstration">
                    <h4>💼 Skills Demonstrated</h4>
                    <div className="skills-grid">
                      {skillsDemonstrated.map((skillCategory, index) => (
                        <div key={index} className="skill-category">
                          <h5>{skillCategory.category}</h5>
                          <div className="skill-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ 
                                  width: `${skillCategory.level}%`,
                                  background: `linear-gradient(90deg, #10b981 0%, #059669 100%)`
                                }}
                              />
                            </div>
                            <span className="progress-text">{skillCategory.level}%</span>
                          </div>
                          <div className="skill-list">
                            {skillCategory.skills.map((skill, idx) => (
                              <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="technical-achievements">
                    <h4>🏆 Key Achievements</h4>
                    <div className="achievements-list">
                      <div className="achievement">
                        <span className="icon">⚡</span>
                        <div>
                          <h5>Electronics Restoration</h5>
                          <p>Successfully diagnosed and replaced faulty motherboard and stepper drivers, restoring full functionality.</p>
                        </div>
                      </div>
                      <div className="achievement">
                        <span className="icon">🔧</span>
                        <div>
                          <h5>Mechanical Precision</h5>
                          <p>Improved print quality by 40% through belt tensioning and linear bearing replacement.</p>
                        </div>
                      </div>
                      <div className="achievement">
                        <span className="icon">💻</span>
                        <div>
                          <h5>Software Integration</h5>
                          <p>Built this comprehensive project management system to track progress and demonstrate capabilities.</p>
                        </div>
                      </div>
                      <div className="achievement">
                        <span className="icon">📊</span>
                        <div>
                          <h5>Project Management</h5>
                          <p>Delivered on time and under budget using agile methodology and careful resource planning.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="timeline-overview">
                <h3>Project Milestones & Timeline</h3>
                <div className="milestones-container">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className={`milestone-card ${milestone.status}`}>
                      <div className="milestone-header">
                        <div className="milestone-info">
                          <h4>{milestone.title}</h4>
                          <span className="milestone-date">{milestone.date}</span>
                        </div>
                        <div className="milestone-status">
                          <span className={`status-badge ${milestone.status}`}>
                            {milestone.status === 'completed' ? '✅' : milestone.status === 'in-progress' ? '🔄' : '⏳'}
                            {milestone.status.replace('-', ' ')}
                          </span>
                          <div className="progress-circle">
                            <svg width="50" height="50">
                              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                              <circle 
                                cx="25" 
                                cy="25" 
                                r="20" 
                                fill="none" 
                                stroke={milestone.status === 'completed' ? '#10b981' : milestone.status === 'in-progress' ? '#f59e0b' : '#64748b'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${milestone.completionPercentage * 1.25}, 125`}
                                transform="rotate(-90 25 25)"
                              />
                              <text x="25" y="30" textAnchor="middle" fontSize="12" fill="white">
                                {milestone.completionPercentage}%
                              </text>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <p className="milestone-description">{milestone.description}</p>
                      
                      <div className="milestone-technologies">
                        <strong>Technologies:</strong>
                        <div className="tech-tags">
                          {milestone.technologies.map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                      
                      {milestone.achievements.length > 0 && (
                        <div className="milestone-achievements">
                          <strong>Achievements:</strong>
                          <ul>
                            {milestone.achievements.map((achievement, idx) => (
                              <li key={idx}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                <div className="budget-header">
                  <h3>Budget Tracker & Financial Management</h3>
                  <button 
                    className="add-expense-button"
                    onClick={() => setShowAddBudgetItem(!showAddBudgetItem)}
                  >
                    <span className="button-icon">💰</span>
                    Add Expense
                  </button>
                </div>

                {showAddBudgetItem && (
                  <motion.div 
                    className="add-expense-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expense Name</label>
                        <input
                          type="text"
                          value={newBudgetItem.name}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, name: e.target.value})}
                          placeholder="Enter expense description..."
                          className="expense-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBudgetItem.cost}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, cost: e.target.value})}
                          placeholder="0.00"
                          className="expense-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={newBudgetItem.category}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, category: e.target.value})}
                          className="expense-select"
                        >
                          <option value="Hardware">Hardware</option>
                          <option value="Tools">Tools</option>
                          <option value="Materials">Materials</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleAddBudgetItem}
                        disabled={!newBudgetItem.name.trim() || !newBudgetItem.cost.trim()}
                      >
                        Add Expense
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setShowAddBudgetItem(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
                
                <div className="budget-summary">
                  <div className="total-budget-card">
                    <h4>Project Financial Summary</h4>
                    <div className="budget-totals">
                      <div className="total-item">
                        <span className="label">Total Budget</span>
                        <span className="value">$400.00</span>
                      </div>
                      <div className="total-item spent">
                        <span className="label">Total Spent</span>
                        <span className="value">$287.97</span>
                      </div>
                      <div className="total-item remaining">
                        <span className="label">Remaining</span>
                        <span className="value">$112.03</span>
                      </div>
                    </div>
                    <div className="overall-progress">
                      <div className="progress-bar-large">
                        <div 
                          className="progress-fill-large"
                          style={{ width: `${(287.97 / 400) * 100}%` }}
                        />
                      </div>
                      <span className="progress-percentage">{Math.round((287.97 / 400) * 100)}% Used</span>
                    </div>
                  </div>
                </div>

                <div className="budget-cards">
                  {budgetData.map((item) => (
                    <div key={item.category} className="budget-card enhanced">
                      <div className="budget-card-header">
                        <h4>{item.category}</h4>
                        <span className="category-status">
                          {item.remaining > 0 ? '✅ On Budget' : '⚠️ Over Budget'}
                        </span>
                      </div>
                      
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

                      <div className="expense-breakdown">
                        <h5>Recent Expenses</h5>
                        <div className="expense-list">
                          {item.items.map((expense, idx) => (
                            <div key={idx} className="expense-item">
                              <span className="expense-name">{expense.name}</span>
                              <div className="expense-info">
                                <span className="expense-cost">${expense.cost.toFixed(2)}</span>
                                <span className="expense-date">{expense.date}</span>
                              </div>
                            </div>
                          ))}
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
                <div className="inventory-header">
                  <h3>Inventory Management & Resource Tracking</h3>
                  <button 
                    className="add-inventory-button"
                    onClick={() => setShowAddInventoryItem(!showAddInventoryItem)}
                  >
                    <span className="button-icon">📦</span>
                    Add Item
                  </button>
                </div>

                {showAddInventoryItem && (
                  <motion.div 
                    className="add-inventory-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>Item Name</label>
                        <input
                          type="text"
                          value={newInventoryItem.name}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, name: e.target.value})}
                          placeholder="Enter item name..."
                          className="inventory-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Current Stock</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={newInventoryItem.current}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, current: e.target.value})}
                          placeholder="0"
                          className="inventory-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Minimum Stock</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={newInventoryItem.minimum}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, minimum: e.target.value})}
                          placeholder="0"
                          className="inventory-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit</label>
                        <select
                          value={newInventoryItem.unit}
                          onChange={(e) => setNewInventoryItem({...newInventoryItem, unit: e.target.value})}
                          className="inventory-select"
                        >
                          <option value="pcs">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="m">Meters</option>
                          <option value="L">Liters</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleAddInventoryItem}
                        disabled={!newInventoryItem.name.trim() || !newInventoryItem.current.trim() || !newInventoryItem.minimum.trim()}
                      >
                        Add Item
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setShowAddInventoryItem(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
                
                <div className="inventory-summary">
                  <div className="inventory-stats">
                    <div className="inventory-stat good">
                      <span className="stat-number">{inventoryData.filter(item => item.status === 'good').length}</span>
                      <span className="stat-label">Well Stocked</span>
                    </div>
                    <div className="inventory-stat warning">
                      <span className="stat-number">{inventoryData.filter(item => item.status === 'warning').length}</span>
                      <span className="stat-label">Low Stock</span>
                    </div>
                    <div className="inventory-stat critical">
                      <span className="stat-number">{inventoryData.filter(item => item.status === 'critical').length}</span>
                      <span className="stat-label">Out of Stock</span>
                    </div>
                  </div>
                </div>

                <div className="inventory-grid">
                  {inventoryData.map((item) => (
                    <div key={item.name} className={`inventory-card enhanced ${item.status}`}>
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
                          Min Required: {item.minimum} {item.unit}
                        </div>
                        <div className="inventory-updated">
                          Last Updated: {item.lastUpdated}
                        </div>
                        
                        {item.supplier && (
                          <div className="supplier-info">
                            <strong>Supplier:</strong> {item.supplier}
                          </div>
                        )}
                        
                        {item.estimatedCost && (
                          <div className="estimated-cost">
                            <strong>Est. Cost:</strong> ${item.estimatedCost.toFixed(2)}
                          </div>
                        )}
                        
                        <div className="inventory-actions">
                          {item.status === 'critical' && (
                            <button 
                              className="reorder-button urgent"
                              onClick={() => handleReorderItem(item.name)}
                            >
                              🛒 Order Now
                            </button>
                          )}
                          
                          {item.status === 'warning' && (
                            <button 
                              className="reorder-button warning"
                              onClick={() => handleReorderItem(item.name)}
                            >
                              📝 Add to Order List
                            </button>
                          )}

                          {item.status === 'good' && (
                            <button 
                              className="reorder-button good"
                              onClick={() => handleReorderItem(item.name)}
                            >
                              ➕ Restock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="analytics-overview">
                <h3>Project Analytics & Performance Metrics</h3>
                
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>📊 Task Completion Trends</h4>
                    <div className="trend-chart">
                      <div className="chart-placeholder">
                        <div className="chart-bars">
                          <div className="bar" style={{ height: '60%' }}>
                            <span className="bar-label">Week 1</span>
                          </div>
                          <div className="bar" style={{ height: '80%' }}>
                            <span className="bar-label">Week 2</span>
                          </div>
                          <div className="bar" style={{ height: '65%' }}>
                            <span className="bar-label">Week 3</span>
                          </div>
                          <div className="bar" style={{ height: '90%' }}>
                            <span className="bar-label">Week 4</span>
                          </div>
                        </div>
                        <p>Tasks completed per week showing steady improvement</p>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>💰 Budget Utilization</h4>
                    <div className="budget-chart">
                      <div className="donut-chart">
                        <svg width="150" height="150" viewBox="0 0 150 150">
                          <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20"/>
                          <circle 
                            cx="75" 
                            cy="75" 
                            r="60" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeDasharray={`${(287.97 / 400) * 377}, 377`}
                            transform="rotate(-90 75 75)"
                          />
                          <text x="75" y="80" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">
                            72%
                          </text>
                        </svg>
                      </div>
                      <div className="budget-breakdown-mini">
                        <div className="breakdown-item">
                          <span className="color-dot" style={{ background: '#10b981' }}></span>
                          <span>Used: $287.97</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="color-dot" style={{ background: 'rgba(255,255,255,0.3)' }}></span>
                          <span>Remaining: $112.03</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>⚡ Performance Indicators</h4>
                    <div className="kpi-list">
                      <div className="kpi-item">
                        <span className="kpi-label">Project Velocity</span>
                        <div className="kpi-value-wrapper">
                          <span className="kpi-value">8.5</span>
                          <span className="kpi-unit">tasks/week</span>
                          <span className="kpi-trend positive">↗ +15%</span>
                        </div>
                      </div>
                      
                      <div className="kpi-item">
                        <span className="kpi-label">Budget Efficiency</span>
                        <div className="kpi-value-wrapper">
                          <span className="kpi-value">94</span>
                          <span className="kpi-unit">%</span>
                          <span className="kpi-trend positive">↗ +8%</span>
                        </div>
                      </div>
                      
                      <div className="kpi-item">
                        <span className="kpi-label">Resource Utilization</span>
                        <div className="kpi-value-wrapper">
                          <span className="kpi-value">87</span>
                          <span className="kpi-unit">%</span>
                          <span className="kpi-trend positive">↗ +12%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h4>🎯 Project Health Score</h4>
                    <div className="health-score">
                      <div className="score-display">
                        <span className="score-number">92</span>
                        <span className="score-label">Excellent</span>
                      </div>
                      <div className="health-factors">
                        <div className="factor">
                          <span className="factor-name">Timeline</span>
                          <div className="factor-bar">
                            <div className="factor-fill" style={{ width: '95%', background: '#10b981' }}></div>
                          </div>
                        </div>
                        <div className="factor">
                          <span className="factor-name">Budget</span>
                          <div className="factor-bar">
                            <div className="factor-fill" style={{ width: '88%', background: '#f59e0b' }}></div>
                          </div>
                        </div>
                        <div className="factor">
                          <span className="factor-name">Quality</span>
                          <div className="factor-bar">
                            <div className="factor-fill" style={{ width: '92%', background: '#10b981' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
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
