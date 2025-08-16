import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore } from '../shared/store';
import { BudgetCategory } from '../../../services/project-management-api';

export const BudgetManager: React.FC = () => {
  const { 
    categories, 
    expenses, 
    loading, 
    error, 
    fetchBudgetData,
    createBudgetCategory
  } = useBudgetStore();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    budgetedAmount: 0,
    description: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBudgetCategory(newCategory);
      setNewCategory({ name: '', budgetedAmount: 0, description: '', currency: 'USD' });
      setShowAddCategory(false);
    } catch (error) {
      console.error('Failed to add budget category:', error);
    }
  };

  const calculateTotalBudget = () => {
    return categories.reduce((total, category) => total + category.budgetedAmount, 0);
  };

  const calculateTotalSpent = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategorySpent = (categoryId: string) => {
    return expenses
      .filter(expense => expense.categoryId === categoryId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getBudgetProgress = (category: BudgetCategory) => {
    const spent = getCategorySpent(category.id);
    const percentage = category.budgetedAmount > 0 ? (spent / category.budgetedAmount) * 100 : 0;
    return { spent, percentage: Math.min(percentage, 100) };
  };

  if (loading) {
    return (
      <div className="budget-loading">
        <div className="loading-spinner"></div>
        <p>Loading budget data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-error">
        <p>Error: {error}</p>
        <button onClick={fetchBudgetData}>Retry</button>
      </div>
    );
  }

  const totalBudget = calculateTotalBudget();
  const totalSpent = calculateTotalSpent();
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="budget-manager">
      {/* Budget Overview */}
      <div className="budget-overview">
        <div className="budget-summary-cards">
          <motion.div 
            className="summary-card total-budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3>Total Budget</h3>
            <div className="amount">${totalBudget.toLocaleString()}</div>
            <p className="description">Allocated funds</p>
          </motion.div>

          <motion.div 
            className="summary-card spent-budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Total Spent</h3>
            <div className="amount">${totalSpent.toLocaleString()}</div>
            <p className="description">Expenses to date</p>
          </motion.div>

          <motion.div 
            className="summary-card remaining-budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Remaining</h3>
            <div className={`amount ${remainingBudget < 0 ? 'negative' : ''}`}>
              ${remainingBudget.toLocaleString()}
            </div>
            <p className="description">Available funds</p>
          </motion.div>

          <motion.div 
            className="summary-card budget-utilization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Utilization</h3>
            <div className="amount">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
            </div>
            <p className="description">Budget used</p>
          </motion.div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="budget-categories">
        <div className="section-header">
          <h2>Budget Categories</h2>
          <button 
            className="add-category-btn"
            onClick={() => setShowAddCategory(true)}
          >
            + Add Category
          </button>
        </div>

        {showAddCategory && (
          <motion.form 
            className="add-category-form"
            onSubmit={handleAddCategory}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-group">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Budgeted amount"
                value={newCategory.budgetedAmount}
                onChange={(e) => setNewCategory({ ...newCategory, budgetedAmount: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Description (optional)"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory({ name: '', budgetedAmount: 0, description: '', currency: 'USD' });
                }}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        <div className="categories-grid">
          {categories.map((category: BudgetCategory) => {
            const { spent, percentage } = getBudgetProgress(category);
            
            return (
              <motion.div
                key={category.id}
                className="category-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="category-header">
                  <h3>{category.name}</h3>
                  <div className="category-amounts">
                    <span className="spent">${spent.toLocaleString()}</span>
                    <span className="budgeted">/ ${category.budgetedAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${percentage > 90 ? 'warning' : percentage > 100 ? 'over-budget' : ''}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="category-details">
                  <p className="percentage">{percentage.toFixed(1)}% used</p>
                  {category.description && (
                    <p className="description">{category.description}</p>
                  )}
                </div>

                <div className="category-status">
                  {percentage > 100 && (
                    <span className="status-badge over-budget">Over Budget</span>
                  )}
                  {percentage > 90 && percentage <= 100 && (
                    <span className="status-badge warning">Near Limit</span>
                  )}
                  {percentage <= 50 && (
                    <span className="status-badge healthy">Healthy</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <h3>No budget categories</h3>
            <p>Create your first budget category to start tracking expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
