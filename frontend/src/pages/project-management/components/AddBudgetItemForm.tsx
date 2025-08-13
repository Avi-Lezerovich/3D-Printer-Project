import { motion } from 'framer-motion';
import { useState } from 'react';

interface AddBudgetItemFormProps {
  onAdd: (item: { name: string; cost: string; category: string; description: string }) => void;
  onClose: () => void;
}

const AddBudgetItemForm = ({ onAdd, onClose }: AddBudgetItemFormProps) => {
  const [newItem, setNewItem] = useState({
    name: '',
    cost: '',
    category: 'Hardware',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.cost.trim()) {
      onAdd(newItem);
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
            <h2>Add Budget Item</h2>
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
              name="cost"
              placeholder="Cost"
              value={newItem.cost}
              onChange={handleChange}
              required
            />
            <select name="category" value={newItem.category} onChange={handleChange}>
              <option>Hardware</option>
              <option>Tools</option>
              <option>Materials</option>
              <option>Software</option>
              <option>Other</option>
            </select>
            <textarea
              name="description"
              placeholder="Description"
              value={newItem.description}
              onChange={handleChange}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-primary">
              Add
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

export default AddBudgetItemForm;
