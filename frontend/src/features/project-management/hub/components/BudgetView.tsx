/**
 * Budget View Component
 * Professional budget management interface with expense tracking
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
}

interface Expense {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  vendor: string;
  status: 'pending' | 'approved' | 'paid';
}

// Mock data for demonstration
const mockCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Hardware Components',
    description: 'Mechanical parts, electronics, and structural components',
    budgetedAmount: 2500,
    spentAmount: 1850,
    color: '#0ea5e9',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Filament & Materials',
    description: 'PLA, PETG, ABS filaments and printing materials',
    budgetedAmount: 800,
    spentAmount: 620,
    color: '#22c55e',
    priority: 'high'
  },
  {
    id: '3',
    name: 'Tools & Equipment',
    description: 'Workshop tools, measurement devices, and accessories',
    budgetedAmount: 1200,
    spentAmount: 890,
    color: '#f59e0b',
    priority: 'medium'
  },
  {
    id: '4',
    name: 'Software & Licenses',
    description: 'CAD software, slicing software licenses',
    budgetedAmount: 400,
    spentAmount: 299,
    color: '#8b5cf6',
    priority: 'low'
  },
  {
    id: '5',
    name: 'Maintenance & Repairs',
    description: 'Replacement parts and maintenance supplies',
    budgetedAmount: 600,
    spentAmount: 145,
    color: '#ef4444',
    priority: 'medium'
  }
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    categoryId: '1',
    title: 'Stepper Motors (4x NEMA17)',
    description: 'High-torque stepper motors for X, Y, Z, and E axes',
    amount: 280,
    date: '2025-01-08',
    vendor: 'StepperOnline',
    status: 'paid'
  },
  {
    id: '2',
    categoryId: '2',
    title: 'PLA+ Filament Bundle',
    description: '10 spools of various colors PLA+ filament',
    amount: 150,
    date: '2025-01-10',
    vendor: 'SUNLU',
    status: 'paid'
  },
  {
    id: '3',
    categoryId: '1',
    title: 'Heated Bed Assembly',
    description: 'Silicone heated bed with thermistor and wiring',
    amount: 85,
    date: '2025-01-12',
    vendor: 'E3D Online',
    status: 'approved'
  },
  {
    id: '4',
    categoryId: '3',
    title: 'Digital Calipers',
    description: 'Precision measurement tool for quality control',
    amount: 45,
    date: '2025-01-14',
    vendor: 'Mitutoyo',
    status: 'pending'
  }
];

const BudgetCategoryCard: React.FC<{ 
  category: BudgetCategory; 
  expenses: Expense[];
  onEdit: (category: BudgetCategory) => void; 
  onAddExpense: (categoryId: string) => void;
}> = ({ category, expenses, onEdit, onAddExpense }) => {
  const utilizationRate = (category.spentAmount / category.budgetedAmount) * 100;
  const remainingAmount = category.budgetedAmount - category.spentAmount;
  const categoryExpenses = expenses.filter(e => e.categoryId === category.id);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 100) return '#ef4444'; // Red for over budget
    if (rate >= 80) return '#f59e0b'; // Orange for near limit
    return '#22c55e'; // Green for healthy
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      className="budget-category-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="category-header">
        <div className="category-info">
          <h4 className="category-name" style={{ color: category.color }}>
            {category.name}
          </h4>
          <p className="category-description">{category.description}</p>
        </div>
        <div className="category-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit(category)}
            title="Edit category"
          >
            ✏️
          </button>
          <button 
            className="action-btn add-btn"
            onClick={() => onAddExpense(category.id)}
            title="Add expense"
          >
            ➕
          </button>
        </div>
      </div>

      <div className="budget-metrics">
        <div className="metric-row">
          <span className="metric-label">Budgeted:</span>
          <span className="metric-value">{formatCurrency(category.budgetedAmount)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Spent:</span>
          <span className="metric-value spent">{formatCurrency(category.spentAmount)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Remaining:</span>
          <span className={`metric-value ${remainingAmount < 0 ? 'over-budget' : 'remaining'}`}>
            {formatCurrency(remainingAmount)}
          </span>
        </div>
      </div>

      <div className="utilization-progress">
        <div className="progress-header">
          <span className="progress-label">Budget Utilization</span>
          <span className={`progress-percentage ${utilizationRate > 100 ? 'over-budget' : ''}`}>
            {utilizationRate.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilizationRate, 100)}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ backgroundColor: getUtilizationColor(utilizationRate) }}
          />
          {utilizationRate > 100 && (
            <div 
              className="progress-overflow"
              style={{ width: `${utilizationRate - 100}%` }}
            />
          )}
        </div>
      </div>

      <div className="expense-summary">
        <div className="summary-stat">
          <span className="stat-label">Expenses:</span>
          <span className="stat-value">{categoryExpenses.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Priority:</span>
          <span className={`stat-value priority-${category.priority}`}>
            {category.priority}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ExpenseItem: React.FC<{ 
  expense: Expense; 
  category: BudgetCategory;
  onEdit: (expense: Expense) => void; 
  onDelete: (id: string) => void;
}> = ({ expense, category, onEdit, onDelete }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'pm-badge-success';
      case 'approved': return 'pm-badge-warning';
      case 'pending': return 'pm-badge-gray';
      default: return 'pm-badge-gray';
    }
  };

  return (
    <motion.div 
      className="expense-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="expense-main">
        <div className="expense-info">
          <h5 className="expense-title">{expense.title}</h5>
          <p className="expense-description">{expense.description}</p>
          <div className="expense-meta">
            <span className="expense-vendor">🏪 {expense.vendor}</span>
            <span className="expense-date">📅 {formatDate(expense.date)}</span>
            <span 
              className="expense-category"
              style={{ color: category.color }}
            >
              📁 {category.name}
            </span>
          </div>
        </div>
        <div className="expense-amount">
          <span className="amount-value">{formatCurrency(expense.amount)}</span>
          <span className={`expense-status pm-badge ${getStatusColor(expense.status)}`}>
            {expense.status}
          </span>
        </div>
      </div>
      <div className="expense-actions">
        <button 
          className="action-btn edit-btn"
          onClick={() => onEdit(expense)}
          title="Edit expense"
        >
          ✏️
        </button>
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(expense.id)}
          title="Delete expense"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
};

export const BudgetView: React.FC = () => {
  const [categories] = useState<BudgetCategory[]>(mockCategories);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [activeTab, setActiveTab] = useState<'categories' | 'expenses'>('categories');

  const handleEditCategory = (category: BudgetCategory) => {
    // TODO: Implement edit modal (logging suppressed for lint cleanliness)
    void category
  };

  const handleAddExpense = (categoryId: string) => {
    // TODO: Implement add expense modal
    void categoryId
  };

  const handleEditExpense = (expense: Expense) => {
    // TODO: Implement edit modal
    void expense
  };

  const handleDeleteExpense = (id: string) => {
    // TODO: integrate confirmation modal
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const getBudgetOverview = () => {
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const utilizationRate = (totalSpent / totalBudgeted) * 100;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      utilizationRate,
      categoriesCount: categories.length,
      expensesCount: expenses.length
    };
  };

  const overview = getBudgetOverview();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="budget-view">
      {/* Header */}
      <motion.div 
        className="budget-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="header-content">
          <h2>💰 Budget Management</h2>
          <p>Track expenses and manage your 3D printer project budget effectively</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="pm-btn pm-btn-secondary"
            onClick={() => handleAddExpense('')}
          >
            ➕ Add Expense
          </button>
        </div>
      </motion.div>

      {/* Budget Overview */}
      <motion.section 
        className="budget-overview-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="overview-grid">
          <div className="overview-card total">
            <div className="overview-icon">💳</div>
            <div className="overview-content">
              <span className="overview-value">{formatCurrency(overview.totalBudgeted)}</span>
              <span className="overview-label">Total Budget</span>
            </div>
          </div>
          <div className="overview-card spent">
            <div className="overview-icon">💸</div>
            <div className="overview-content">
              <span className="overview-value">{formatCurrency(overview.totalSpent)}</span>
              <span className="overview-label">Total Spent</span>
            </div>
          </div>
          <div className="overview-card remaining">
            <div className="overview-icon">💰</div>
            <div className="overview-content">
              <span className={`overview-value ${overview.totalRemaining < 0 ? 'over-budget' : ''}`}>
                {formatCurrency(overview.totalRemaining)}
              </span>
              <span className="overview-label">Remaining</span>
            </div>
          </div>
          <div className="overview-card utilization">
            <div className="overview-icon">📊</div>
            <div className="overview-content">
              <span className={`overview-value ${overview.utilizationRate > 100 ? 'over-budget' : ''}`}>
                {overview.utilizationRate.toFixed(1)}%
              </span>
              <span className="overview-label">Utilization</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tab Navigation */}
      <motion.section 
        className="budget-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📁 Budget Categories ({categories.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            💸 Recent Expenses ({expenses.length})
          </button>
        </div>
      </motion.section>

      {/* Tab Content */}
      <motion.section 
        className="budget-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {activeTab === 'categories' && (
          <div className="categories-grid">
            {categories.map(category => (
              <BudgetCategoryCard
                key={category.id}
                category={category}
                expenses={expenses}
                onEdit={handleEditCategory}
                onAddExpense={handleAddExpense}
              />
            ))}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-list">
            <h3 className="section-title">Recent Expenses</h3>
            <div className="expenses-container">
              {expenses.map(expense => {
                const category = categories.find(cat => cat.id === expense.categoryId);
                return category ? (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    category={category}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                  />
                ) : null;
              })}
            </div>
            
            {expenses.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <span style={{ fontSize: '4rem' }}>💸</span>
                </div>
                <h3>No expenses recorded</h3>
                <p>Start by adding your first project expense.</p>
                <button 
                  className="pm-btn pm-btn-primary"
                  onClick={() => handleAddExpense('')}
                >
                  ➕ Add Your First Expense
                </button>
              </div>
            )}
          </div>
        )}
      </motion.section>
    </div>
  );
};