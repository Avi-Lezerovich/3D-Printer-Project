import { motion } from 'framer-motion';
import { useState } from 'react';
import { InventoryItem } from '../types';

interface AddInventoryItemFormProps {
  onAdd: (item: Omit<InventoryItem, 'status' | 'lastUpdated'>) => void;
  onClose: () => void;
}

const AddInventoryItemForm = ({ onAdd, onClose }: AddInventoryItemFormProps) => {
  const [newItem, setNewItem] = useState({
    name: '',
    current: '',
    minimum: '',
    unit: 'pcs',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.current.trim() && newItem.minimum.trim()) {
      onAdd({
        ...newItem,
        current: parseFloat(newItem.current),
        minimum: parseFloat(newItem.minimum),
      });
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="modal-content enhanced">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Add Inventory Item</h2>
            <button type="button" onClick={onClose} className="close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              value={newItem.name}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="current"
              placeholder="Current Quantity"
              value={newItem.current}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="minimum"
              placeholder="Minimum Quantity"
              value={newItem.minimum}
              onChange={handleChange}
              required
            />
            <select name="unit" value={newItem.unit} onChange={handleChange}>
              <option>pcs</option>
              <option>kg</option>
              <option>m</option>
              <option>%</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-primary">
              Add Item
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddInventoryItemForm;
