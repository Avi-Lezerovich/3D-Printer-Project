import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InventoryItem } from './types';

export default function Inventory() {
  const [showAddInventoryItem, setShowAddInventoryItem] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({ 
    name: '', 
    current: '', 
    minimum: '', 
    unit: 'pcs' 
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Initialize inventory data
    setInventoryItems([
      {
        name: 'Stepper Motors',
        current: 4,
        minimum: 2,
        unit: 'pcs',
        status: 'good',
        lastUpdated: '2025-08-10',
        supplier: 'Amazon',
        estimatedCost: 45.00
      },
      {
        name: 'PLA Filament',
        current: 1.2,
        minimum: 2.0,
        unit: 'kg',
        status: 'warning',
        lastUpdated: '2025-08-12',
        supplier: 'Hatchbox',
        estimatedCost: 25.99
      },
      {
        name: 'Nozzles (0.4mm)',
        current: 2,
        minimum: 5,
        unit: 'pcs',
        status: 'critical',
        lastUpdated: '2025-08-11',
        supplier: 'E3D',
        estimatedCost: 8.50
      },
      {
        name: 'Thermal Paste',
        current: '50%',
        minimum: 25,
        unit: '%',
        status: 'good',
        lastUpdated: '2025-08-09',
        supplier: 'Arctic',
        estimatedCost: 12.99
      },
      {
        name: 'Belts (GT2)',
        current: 3,
        minimum: 1,
        unit: 'm',
        status: 'good',
        lastUpdated: '2025-08-08',
        supplier: 'Gates',
        estimatedCost: 15.00
      }
    ]);
  }, []);

  const handleAddInventoryItem = () => {
    if (newInventoryItem.name.trim() && newInventoryItem.current.trim() && newInventoryItem.minimum.trim()) {
      const current = parseFloat(newInventoryItem.current);
      const minimum = parseFloat(newInventoryItem.minimum);
      
      if (!isNaN(current) && !isNaN(minimum)) {
        const status: 'good' | 'warning' | 'critical' = 
          current <= minimum * 0.5 ? 'critical' :
          current <= minimum ? 'warning' : 'good';

        const newItem: InventoryItem = {
          name: newInventoryItem.name,
          current,
          minimum,
          unit: newInventoryItem.unit,
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        setInventoryItems(prev => [...prev, newItem]);
        setNewInventoryItem({ name: '', current: '', minimum: '', unit: 'pcs' });
        setShowAddInventoryItem(false);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🔴';
      default: return '❓';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'good': return 'status-good';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-unknown';
    }
  };

  const criticalItems = inventoryItems.filter(item => item.status === 'critical');
  const warningItems = inventoryItems.filter(item => item.status === 'warning');

  return (
    <motion.div
      key="inventory"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="tab-content"
    >
      <div className="inventory-header">
        <h3>Inventory Management</h3>
        <button 
          className="add-inventory-btn"
          onClick={() => setShowAddInventoryItem(true)}
        >
          <span className="btn-icon">📦</span>
          Add Item
        </button>
      </div>

      {(criticalItems.length > 0 || warningItems.length > 0) && (
        <div className="inventory-alerts">
          {criticalItems.length > 0 && (
            <div className="alert critical">
              <span className="alert-icon">🔴</span>
              <span className="alert-text">
                {criticalItems.length} item(s) critically low: {criticalItems.map(item => item.name).join(', ')}
              </span>
            </div>
          )}
          {warningItems.length > 0 && (
            <div className="alert warning">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">
                {warningItems.length} item(s) running low: {warningItems.map(item => item.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="inventory-grid">
        {inventoryItems.map((item, index) => (
          <motion.div 
            key={item.name}
            className={`inventory-card ${getStatusClass(item.status)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="card-header">
              <h4>{item.name}</h4>
              <span className="status-indicator">
                {getStatusIcon(item.status)}
              </span>
            </div>
            
            <div className="card-content">
              <div className="quantity-info">
                <div className="current-stock">
                  <span className="label">Current:</span>
                  <span className="value">{item.current} {item.unit}</span>
                </div>
                <div className="minimum-stock">
                  <span className="label">Minimum:</span>
                  <span className="value">{item.minimum} {item.unit}</span>
                </div>
              </div>
              
              <div className="item-details">
                <div className="detail-row">
                  <span className="label">Last Updated:</span>
                  <span className="value">{item.lastUpdated}</span>
                </div>
                {item.supplier && (
                  <div className="detail-row">
                    <span className="label">Supplier:</span>
                    <span className="value">{item.supplier}</span>
                  </div>
                )}
                {item.estimatedCost && (
                  <div className="detail-row">
                    <span className="label">Est. Cost:</span>
                    <span className="value">${item.estimatedCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAddInventoryItem && (
        <motion.div 
          className="add-inventory-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-content">
            <h4>Add Inventory Item</h4>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={newInventoryItem.name}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                placeholder="Enter item name..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Current Stock</label>
                <input
                  type="number"
                  step="0.1"
                  value={newInventoryItem.current}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, current: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Minimum Stock</label>
                <input
                  type="number"
                  step="0.1"
                  value={newInventoryItem.minimum}
                  onChange={(e) => setNewInventoryItem({ ...newInventoryItem, minimum: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select 
                value={newInventoryItem.unit}
                onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })}
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="m">Meters</option>
                <option value="cm">Centimeters</option>
                <option value="L">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="%">Percentage</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddInventoryItem} className="primary-btn">Add Item</button>
              <button onClick={() => setShowAddInventoryItem(false)} className="secondary-btn">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
