/**
 * BudgetOverview Component
 * 
 * Main container for budget management with filtering, metrics display,
 * and category management. Follows modular patterns from the design system.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetStore } from '../store/budgetStore';
import BudgetCard from './BudgetCard';
import { BudgetCategory } from '../../shared/types';
import { formatCurrency } from '../../shared/utils';

interface BudgetOverviewProps {
  className?: string;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'budgeted' | 'spent' | 'remaining'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-track' | 'near-limit' | 'over-budget'>('all');

  // Budget store state
  const {
    categories,
    expenses,
    metrics,
    loading,
    error,
    selectedPeriod,
    selectedCategory
  } = useBudgetStore();

  // Budget store actions
  const {
    fetchCategories,
    fetchExpenses,
    fetchMetrics,
    setSelectedPeriod,
    selectCategory,
    openCreateCategoryModal
  } = useBudgetStore();

  // Initialize data
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchMetrics();
  }, [fetchCategories, fetchExpenses, fetchMetrics]);

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
      const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const spendingRate = category.budgetedAmount > 0 ? (totalSpent / category.budgetedAmount) * 100 : 0;
      
      const matchesFilters = 
        (statusFilter === 'all' || 
         (statusFilter === 'over-budget' && totalSpent > category.budgetedAmount) ||
         (statusFilter === 'near-limit' && spendingRate > 80 && totalSpent <= category.budgetedAmount) ||
         (statusFilter === 'on-track' && spendingRate <= 80));

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      // Initialize upfront to avoid lexical declarations inside switch (no-case-declarations rule)
      let aValue: number | string = '';
      let bValue: number | string = '';
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === 'budgeted') {
        aValue = a.budgetedAmount;
        bValue = b.budgetedAmount;
      } else if (sortBy === 'spent') {
        aValue = expenses.filter(exp => exp.categoryId === a.id).reduce((sum, exp) => sum + exp.amount, 0);
        bValue = expenses.filter(exp => exp.categoryId === b.id).reduce((sum, exp) => sum + exp.amount, 0);
      } else if (sortBy === 'remaining') {
        const aSpent = expenses.filter(exp => exp.categoryId === a.id).reduce((sum, exp) => sum + exp.amount, 0);
        const bSpent = expenses.filter(exp => exp.categoryId === b.id).reduce((sum, exp) => sum + exp.amount, 0);
        aValue = a.budgetedAmount - aSpent;
        bValue = b.budgetedAmount - bSpent;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

  const handleCategoryClick = (category: BudgetCategory) => {
    const newSelection = category.id === selectedCategory?.id ? null : category;
    selectCategory(newSelection);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePeriodChange = (period: 'week' | 'month' | 'quarter' | 'year') => {
    setSelectedPeriod(period);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as 'all' | 'on-track' | 'near-limit' | 'over-budget');
  };

  if (loading && categories.length === 0) {
    return (
      <div className={`budget-overview loading ${className}`}>
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading budget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`budget-overview error ${className}`}>
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </div>
          <h3>Failed to load budget data</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => {
              fetchCategories();
              fetchExpenses();
              fetchMetrics();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`budget-overview ${className}`}>
      {/* Header */}
      <div className="budget-header">
        <div className="header-content">
          <h2>Budget Management</h2>
          <p className="header-description">
            Track spending across categories and manage your project budget effectively
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => openCreateCategoryModal()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Budget Metrics */}
      {metrics && (
        <div className="budget-metrics-overview">
          <div className="metrics-grid">
            <div className="metric-card total">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Budget</span>
                <span className="metric-value">{formatCurrency(metrics.totalBudget, 'USD')}</span>
              </div>
            </div>

            <div className="metric-card spent">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Spent</span>
                <span className="metric-value spent">{formatCurrency(metrics.totalSpent, 'USD')}</span>
              </div>
            </div>

            <div className="metric-card remaining">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Remaining</span>
                <span className={`metric-value ${metrics.totalRemaining < 0 ? 'over-budget' : 'remaining'}`}>
                  {formatCurrency(metrics.totalRemaining, 'USD')}
                </span>
              </div>
            </div>

            <div className="metric-card utilization">
              <div className="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                  <path d="m8.5 14 7-4" />
                  <path d="m8.5 10 7 4" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-label">Utilization</span>
                <span className={`metric-value ${metrics.utilizationRate > 100 ? 'over-budget' : ''}`}>
                  {metrics.utilizationRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="budget-controls">
        <div className="controls-left">
          {/* Period Selector */}
          <div className="period-selector">
            <label>Period:</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="select-field"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="status-filter">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="select-field"
            >
              <option value="all">All Categories</option>
              <option value="on-track">On Track</option>
              <option value="near-limit">Near Limit</option>
              <option value="over-budget">Over Budget</option>
            </select>
          </div>
        </div>

        <div className="controls-right">
          {/* Search */}
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort Controls */}
          <div className="sort-controls">
            <label>Sort by:</label>
            <div className="sort-buttons">
              {['name', 'budgeted', 'spent', 'remaining'].map((field) => (
                <button
                  key={field}
                  className={`sort-button ${sortBy === field ? 'active' : ''}`}
                  onClick={() => handleSort(field as typeof sortBy)}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortBy === field && (
                    <span className="sort-direction">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="budget-grid">
        <AnimatePresence mode="wait">
          {filteredCategories.length === 0 ? (
            <motion.div
              key="empty-state"
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>No budget categories found</h3>
              <p>
                {searchTerm ? 
                  `No categories match "${searchTerm}". Try a different search term.` :
                  'Start by creating your first budget category to track expenses.'
                }
              </p>
              {!searchTerm && (
                <button 
                  className="btn-primary"
                  onClick={() => openCreateCategoryModal()}
                >
                  Create First Category
                </button>
              )}
            </motion.div>
          ) : (
            filteredCategories.map((category) => (
              <BudgetCard
                key={category.id}
                category={category}
                expenses={expenses.filter(exp => exp.categoryId === category.id)}
                isSelected={selectedCategory?.id === category.id}
                onClick={handleCategoryClick}
                // TODO: wire edit/delete callbacks (currently no-op for lint cleanliness)
                onEdit={() => { /* open edit modal */ }}
                onDelete={() => { /* open delete confirm */ }}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && categories.length > 0 && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <div className="spinner" />
              <span>Updating...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetOverview;
