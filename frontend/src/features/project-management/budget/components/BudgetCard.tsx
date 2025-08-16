/**
 * BudgetCard Component
 * 
 * Displays budget category information with spending progress and actions.
 * Following the same modular pattern as TaskCard.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BudgetCategory, 
  BudgetExpense
} from '../../shared/types';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../../shared/utils';

interface BudgetCardProps {
  category: BudgetCategory;
  expenses: BudgetExpense[];
  className?: string;
  onClick?: (category: BudgetCategory) => void;
  onEdit?: (category: BudgetCategory) => void;
  onDelete?: (categoryId: string) => void;
  isSelected?: boolean;
}

// Helper function to calculate progress percentage
const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return (current / total) * 100;
};

const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  expenses,
  className = '',
  onClick,
  onEdit,
  onDelete,
  isSelected = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCategory = useBudgetStore(state => state.deleteCategory);

  // Calculate spending metrics for this category
  const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
  const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = category.budgetedAmount - totalSpent;
  const spendingProgress = calculateProgress(totalSpent, category.budgetedAmount);
  const isOverBudget = totalSpent > category.budgetedAmount;
  const isNearLimit = spendingProgress > 80 && !isOverBudget;

  // Get priority styling based on budget status
  const getPriorityClass = () => {
    if (isOverBudget) return 'priority-urgent';
    if (isNearLimit) return 'priority-high';
    if (spendingProgress < 50) return 'priority-low';
    return 'priority-medium';
  };

  const handleDelete = async () => {
    // Replace native confirm with lightweight inline dialog via custom event (placeholder)
    const confirmed = true; // TODO: integrate design-system modal
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      onDelete?.(category.id);
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClick?.(category);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDelete();
  };

  return (
    <motion.div
      className={`budget-card ${getPriorityClass()} ${isSelected ? 'selected' : ''} ${className}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Category Header */}
      <div className="budget-card-header">
        <div className="category-info">
          <h3 className="category-name">{category.name}</h3>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <motion.div 
          className="budget-card-actions"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: showActions ? 1 : 0,
            scale: showActions ? 1 : 0.8
          }}
          transition={{ duration: 0.15 }}
        >
          <button
            className="btn-action edit"
            onClick={handleEditClick}
            title="Edit category"
            aria-label={`Edit ${category.name} category`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          
          <button
            className="btn-action delete"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete category"
            aria-label={`Delete ${category.name} category`}
          >
            {isDeleting ? (
              <div className="spinner-small" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m3 6 3 0 16 0" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11l0 6M14 11l0 6" />
              </svg>
            )}
          </button>
        </motion.div>
      </div>

      {/* Budget Metrics */}
      <div className="budget-metrics">
        <div className="metric-row">
          <span className="metric-label">Budgeted:</span>
          <span className="metric-value budgeted">
            {formatCurrency(category.budgetedAmount, category.currency)}
          </span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Spent:</span>
          <span className={`metric-value spent ${isOverBudget ? 'over-budget' : ''}`}>
            {formatCurrency(totalSpent, category.currency)}
          </span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Remaining:</span>
          <span className={`metric-value remaining ${isOverBudget ? 'over-budget' : ''}`}>
            {formatCurrency(remainingBudget, category.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="budget-progress">
        <div className="progress-info">
          <span className="progress-label">Usage</span>
          <span className={`progress-percentage ${isOverBudget ? 'over-budget' : ''}`}>
            {spendingProgress.toFixed(1)}%
          </span>
        </div>
        
        <div className="progress-bar">
          <motion.div
            className={`progress-fill ${isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spendingProgress, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {isOverBudget && (
            <motion.div
              className="progress-overflow"
              initial={{ width: 0 }}
              animate={{ width: `${spendingProgress - 100}%` }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            />
          )}
        </div>
      </div>

      {/* Expense Count */}
      <div className="expense-summary">
        <span className="expense-count">
          {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''}
        </span>
        {isOverBudget && (
          <span className="budget-status over-budget">Over Budget</span>
        )}
        {isNearLimit && (
          <span className="budget-status near-limit">Near Limit</span>
        )}
      </div>

      {/* Quick Stats */}
      {categoryExpenses.length > 0 && (
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Avg. Expense:</span>
            <span className="stat-value">
              {formatCurrency(totalSpent / categoryExpenses.length, category.currency)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Last Expense:</span>
            <span className="stat-value">
              {new Date(categoryExpenses[categoryExpenses.length - 1]?.date || '').toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetCard;
