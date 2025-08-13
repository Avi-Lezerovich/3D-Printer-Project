import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetItem } from './types';

export default function BudgetTracker() {
  const [showAddBudgetItem, setShowAddBudgetItem] = useState(false);
  const [newBudgetItem, setNewBudgetItem] = useState({ 
    name: '', 
    cost: '', 
    category: 'Hardware',
    description: ''
  });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    // Initialize budget data
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
          { name: 'Multimeter', cost: 22.01, date: '2025-08-01' }
        ]
      },
      { 
        category: 'Materials', 
        budgeted: 80, 
        spent: 65.75, 
        remaining: 14.25,
        items: [
          { name: 'PLA Filament', cost: 25.50, date: '2025-07-18' },
          { name: 'PETG Filament', cost: 28.99, date: '2025-07-28' },
          { name: 'Nozzles Pack', cost: 11.26, date: '2025-08-05' }
        ]
      }
    ]);
  }, []);

  const handleAddBudgetItem = () => {
    if (newBudgetItem.name.trim() && newBudgetItem.cost.trim()) {
      const cost = parseFloat(newBudgetItem.cost);
      if (!isNaN(cost)) {
        setBudgetItems(prev => prev.map(category => 
          category.category === newBudgetItem.category
            ? {
                ...category,
                spent: category.spent + cost,
                remaining: category.remaining - cost,
                items: [...category.items, { 
                  name: newBudgetItem.name, 
                  cost, 
                  date: new Date().toISOString().split('T')[0] 
                }]
              }
            : category
        ));
        setNewBudgetItem({ name: '', cost: '', category: 'Hardware', description: '' });
        setShowAddBudgetItem(false);
      }
    }
  };

  const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remaining, 0);
  const spentPercentage = (totalSpent / totalBudgeted) * 100;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Hardware': '#3b82f6',
      'Tools': '#10b981', 
      'Materials': '#f59e0b',
      'Software': '#8b5cf6',
      'Other': '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const getSpentPercentage = (category: BudgetItem) => {
    return Math.min((category.spent / category.budgeted) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="budget-tracker-container"
    >
      {/* Enhanced Header */}
      <div className="budget-header">
        <div className="header-main">
          <div className="header-title-section">
            <h2 className="page-title">Budget Tracker</h2>
            <div className="budget-summary-stats">
              <div className="summary-stat">
                <span className="stat-value">${totalBudgeted.toFixed(2)}</span>
                <span className="stat-label">Total Budget</span>
              </div>
              <div className="stat-divider"></div>
              <div className="summary-stat">
                <span className="stat-value" style={{ color: '#ef4444' }}>${totalSpent.toFixed(2)}</span>
                <span className="stat-label">Spent</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value" style={{ color: '#10b981' }}>${totalRemaining.toFixed(2)}</span>
                <span className="stat-label">Remaining</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value" style={{ 
                  color: spentPercentage > 90 ? '#ef4444' : spentPercentage > 70 ? '#f59e0b' : '#10b981' 
                }}>
                  {spentPercentage.toFixed(1)}%
                </span>
                <span className="stat-label">Used</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
                onClick={() => setViewMode('overview')}
                title="Overview"
              >
                <span>📊</span>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setViewMode('detailed')}
                title="Detailed View"
              >
                <span>📋</span>
              </button>
            </div>
            
            <motion.button 
              className="add-expense-btn primary"
              onClick={() => setShowAddBudgetItem(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-icon">💰</span>
              <span className="btn-text">Add Expense</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Budget Overview Progress */}
      <div className="budget-overview-card">
        <div className="overall-progress">
          <div className="progress-header">
            <span className="progress-label">Overall Budget Usage</span>
            <span className="progress-value">{spentPercentage.toFixed(1)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{
                width: `${Math.min(spentPercentage, 100)}%`,
                backgroundColor: spentPercentage > 90 ? '#ef4444' : spentPercentage > 70 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
          <div className="progress-labels">
            <span>$0</span>
            <span>${totalBudgeted.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Add Expense Modal */}
      <AnimatePresence>
        {showAddBudgetItem && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddBudgetItem(false)}
          >
            <motion.div 
              className="modal-content enhanced"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Expense</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddBudgetItem(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="expense-name">Item Name *</label>
                  <input
                    id="expense-name"
                    type="text"
                    value={newBudgetItem.name}
                    onChange={(e) => setNewBudgetItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="What did you purchase?"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expense-cost">Cost *</label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      id="expense-cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newBudgetItem.cost}
                      onChange={(e) => setNewBudgetItem(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="expense-category">Category</label>
                  <div className="category-selector">
                    {(['Hardware', 'Tools', 'Materials', 'Software', 'Other'] as const).map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`category-btn ${newBudgetItem.category === category ? 'active' : ''}`}
                        onClick={() => setNewBudgetItem(prev => ({ ...prev, category }))}
                        style={{
                          '--category-color': getCategoryColor(category)
                        } as React.CSSProperties}
                      >
                        <span className="category-dot"></span>
                        <span className="category-text">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="expense-description">Description</label>
                  <textarea
                    id="expense-description"
                    value={newBudgetItem.description}
                    onChange={(e) => setNewBudgetItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this expense..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  onClick={() => setShowAddBudgetItem(false)} 
                  className="btn secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddBudgetItem} 
                  className="btn primary"
                  disabled={!newBudgetItem.name.trim() || !newBudgetItem.cost.trim()}
                >
                  Add Expense
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="budget-content">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="budget-overview"
            >
              <div className="category-grid">
                {budgetItems.map((category, index) => (
                  <motion.div
                    key={category.category}
                    className="category-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      '--category-color': getCategoryColor(category.category)
                    } as React.CSSProperties}
                  >
                    <div className="category-header">
                      <div className="category-info">
                        <h3 className="category-title">{category.category}</h3>
                        <span className="category-items-count">{category.items.length} items</span>
                      </div>
                      <div className="category-spent-percentage">
                        {getSpentPercentage(category).toFixed(0)}%
                      </div>
                    </div>

                    <div className="category-amounts">
                      <div className="amount-row">
                        <span className="amount-label">Budgeted</span>
                        <span className="amount-value">${category.budgeted.toFixed(2)}</span>
                      </div>
                      <div className="amount-row spent">
                        <span className="amount-label">Spent</span>
                        <span className="amount-value">${category.spent.toFixed(2)}</span>
                      </div>
                      <div className="amount-row remaining">
                        <span className="amount-label">Remaining</span>
                        <span className="amount-value">${category.remaining.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="category-progress">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small"
                          style={{
                            width: `${Math.min(getSpentPercentage(category), 100)}%`,
                            backgroundColor: `var(--category-color)`
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="budget-detailed"
            >
              <div className="detailed-categories">
                {budgetItems.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    className="detailed-category"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <div className="detailed-category-header">
                      <h3 className="category-title-detailed">
                        <span 
                          className="category-dot-detailed"
                          style={{ backgroundColor: getCategoryColor(category.category) }}
                        ></span>
                        {category.category}
                      </h3>
                      <div className="category-summary-detailed">
                        <span>${category.spent.toFixed(2)} / ${category.budgeted.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="expense-items">
                      {category.items.map((item, itemIndex) => (
                        <motion.div
                          key={`${item.name}-${item.date}`}
                          className="expense-item"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                        >
                          <div className="expense-info">
                            <span className="expense-name">{item.name}</span>
                            <span className="expense-date">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <div className="expense-cost">${item.cost.toFixed(2)}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
