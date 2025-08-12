import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BudgetItem } from './types';

export default function BudgetTracker() {
  const [showAddBudgetItem, setShowAddBudgetItem] = useState(false);
  const [newBudgetItem, setNewBudgetItem] = useState({ name: '', cost: '', category: 'Hardware' });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

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
        setNewBudgetItem({ name: '', cost: '', category: 'Hardware' });
        setShowAddBudgetItem(false);
      }
    }
  };

  const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remaining, 0);

  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="tab-content"
    >
      <div className="budget-header">
        <h3>Budget Tracker</h3>
        <button 
          className="add-budget-btn"
          onClick={() => setShowAddBudgetItem(true)}
        >
          <span className="btn-icon">💰</span>
          Add Expense
        </button>
      </div>

      <div className="budget-overview">
        <div className="budget-summary">
          <div className="summary-card">
            <h4>Total Budget</h4>
            <div className="amount budgeted">${totalBudgeted.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h4>Total Spent</h4>
            <div className="amount spent">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h4>Remaining</h4>
            <div className="amount remaining">${totalRemaining.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="budget-categories">
        {budgetItems.map((category, index) => (
          <motion.div 
            key={category.category}
            className="budget-category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="category-header">
              <h4>{category.category}</h4>
              <div className="category-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(category.spent / category.budgeted) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  ${category.spent.toFixed(2)} / ${category.budgeted.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="category-items">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="budget-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-cost">${item.cost.toFixed(2)}</span>
                  <span className="item-date">{item.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showAddBudgetItem && (
        <motion.div 
          className="add-budget-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-content">
            <h4>Add Budget Item</h4>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={newBudgetItem.category}
                onChange={(e) => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })}
              >
                <option value="Hardware">Hardware</option>
                <option value="Tools">Tools</option>
                <option value="Materials">Materials</option>
              </select>
            </div>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={newBudgetItem.name}
                onChange={(e) => setNewBudgetItem({ ...newBudgetItem, name: e.target.value })}
                placeholder="Enter item name..."
              />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={newBudgetItem.cost}
                onChange={(e) => setNewBudgetItem({ ...newBudgetItem, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddBudgetItem} className="primary-btn">Add Item</button>
              <button onClick={() => setShowAddBudgetItem(false)} className="secondary-btn">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
