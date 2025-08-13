import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem as InventoryItemType } from './types';
import AddInventoryItemForm from './components/AddInventoryItemForm';
import InventoryItem from './components/InventoryItem';

export default function Inventory() {
  const [showAddInventoryItem, setShowAddInventoryItem] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);

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
        estimatedCost: 45.0,
      },
      {
        name: 'PLA Filament',
        current: 1.2,
        minimum: 2.0,
        unit: 'kg',
        status: 'warning',
        lastUpdated: '2025-08-12',
        supplier: 'Hatchbox',
        estimatedCost: 25.99,
      },
      {
        name: 'Nozzles (0.4mm)',
        current: 2,
        minimum: 5,
        unit: 'pcs',
        status: 'critical',
        lastUpdated: '2025-08-11',
        supplier: 'E3D',
        estimatedCost: 8.5,
      },
      {
        name: 'Thermal Paste',
        current: '50%',
        minimum: 25,
        unit: '%',
        status: 'good',
        lastUpdated: '2025-08-09',
        supplier: 'Arctic',
        estimatedCost: 12.99,
      },
      {
        name: 'Belts (GT2)',
        current: 3,
        minimum: 1,
        unit: 'm',
        status: 'good',
        lastUpdated: '2025-08-08',
        supplier: 'Gates',
        estimatedCost: 15.0,
      },
    ]);
  }, []);

  const handleAddInventoryItem = (newItem: Omit<InventoryItemType, 'status' | 'lastUpdated'>) => {
    const status: 'good' | 'warning' | 'critical' =
      (newItem.current as number) <= (newItem.minimum as number) * 0.5
        ? 'critical'
        : (newItem.current as number) <= (newItem.minimum as number)
        ? 'warning'
        : 'good';

    const itemToAdd: InventoryItemType = {
      ...newItem,
      status,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setInventoryItems((prev) => [...prev, itemToAdd]);
    setShowAddInventoryItem(false);
  };

  const criticalItems = inventoryItems.filter((item) => item.status === 'critical');
  const warningItems = inventoryItems.filter((item) => item.status === 'warning');

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
        <button className="add-inventory-btn" onClick={() => setShowAddInventoryItem(true)}>
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
                {criticalItems.length} item(s) critically low:{' '}
                {criticalItems.map((item) => item.name).join(', ')}
              </span>
            </div>
          )}
          {warningItems.length > 0 && (
            <div className="alert warning">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">
                {warningItems.length} item(s) running low:{' '}
                {warningItems.map((item) => item.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Minimum Stock</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {inventoryItems.map((item) => (
                <InventoryItem key={item.name} item={item} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddInventoryItem && (
          <AddInventoryItemForm
            onAdd={handleAddInventoryItem}
            onClose={() => setShowAddInventoryItem(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
