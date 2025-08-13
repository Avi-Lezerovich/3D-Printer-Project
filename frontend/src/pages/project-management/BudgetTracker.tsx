import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetItem as BudgetItemType } from './types';
import BudgetSummary from './components/BudgetSummary';
import BudgetItem from './components/BudgetItem';
import AddBudgetItemForm from './components/AddBudgetItemForm';

export default function BudgetTracker() {
  const [showAddBudgetItem, setShowAddBudgetItem] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItemType[]>([]);
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
          { name: 'Stepper Motors', cost: 45.0, date: '2025-07-15' },
          { name: 'Motherboard', cost: 89.99, date: '2025-07-20' },
          { name: 'Hot End', cost: 45.33, date: '2025-08-02' },
        ],
      },
      {
        category: 'Tools',
        budgeted: 100,
        spent: 75.5,
        remaining: 24.5,
        items: [
          { name: 'Digital Calipers', cost: 25.99, date: '2025-07-10' },
          { name: 'Hex Keys Set', cost: 15.5, date: '2025-07-12' },
          { name: 'Thermal Paste', cost: 12.99, date: '2025-07-25' },
          { name: 'Multimeter', cost: 22.01, date: '2025-08-01' },
        ],
      },
      {
        category: 'Materials',
        budgeted: 80,
        spent: 65.75,
        remaining: 14.25,
        items: [
          { name: 'PLA Filament', cost: 25.5, date: '2025-07-18' },
          { name: 'PETG Filament', cost: 28.99, date: '2025-07-28' },
          { name: 'Nozzles Pack', cost: 11.26, date: '2025-08-05' },
        ],
      },
    ]);
  }, []);

  const handleAddBudgetItem = (newItem: {
    name: string;
    cost: string;
    category: string;
    description: string;
  }) => {
    const cost = parseFloat(newItem.cost);
    if (!isNaN(cost)) {
      setBudgetItems((prev) =>
        prev.map((category) =>
          category.category === newItem.category
            ? {
                ...category,
                spent: category.spent + cost,
                remaining: category.remaining - cost,
                items: [
                  ...category.items,
                  {
                    name: newItem.name,
                    cost,
                    date: new Date().toISOString().split('T')[0],
                  },
                ],
              }
            : category
        )
      );
      setShowAddBudgetItem(false);
    }
  };

  const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remaining, 0);
  const spentPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Hardware: '#3b82f6',
      Tools: '#10b981',
      Materials: '#f59e0b',
      Software: '#8b5cf6',
      Other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const getSpentPercentage = (category: BudgetItemType) => {
    return category.budgeted > 0 ? Math.min((category.spent / category.budgeted) * 100, 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="budget-tracker-container"
    >
      <div className="budget-header">
        <div className="header-main">
          <div className="header-title-section">
            <h2 className="page-title">Budget Tracker</h2>
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

      <BudgetSummary
        totalBudgeted={totalBudgeted}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
        spentPercentage={spentPercentage}
      />

      <AnimatePresence>
        {showAddBudgetItem && (
          <AddBudgetItemForm
            onAdd={handleAddBudgetItem}
            onClose={() => setShowAddBudgetItem(false)}
          />
        )}
      </AnimatePresence>

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
                {budgetItems.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BudgetItem
                      item={item}
                      getCategoryColor={getCategoryColor}
                      getSpentPercentage={getSpentPercentage}
                    />
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
                        <span>
                          ${category.spent.toFixed(2)} / ${category.budgeted.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="expense-items">
                      {category.items.map((item, itemIndex) => (
                        <motion.div
                          key={`${item.name}-${item.date}`}
                          className="expense-item"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: categoryIndex * 0.1 + itemIndex * 0.05,
                          }}
                        >
                          <div className="expense-info">
                            <span className="expense-name">{item.name}</span>
                            <span className="expense-date">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
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
