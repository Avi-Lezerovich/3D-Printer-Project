import { motion } from 'framer-motion';
import { BudgetItem as BudgetItemType } from '../types';

interface BudgetItemProps {
  item: BudgetItemType;
  getCategoryColor: (category: string) => string;
  getSpentPercentage: (item: BudgetItemType) => number;
}

const BudgetItem = ({ item, getCategoryColor, getSpentPercentage }: BudgetItemProps) => {
  return (
    <motion.div
      className="budget-category-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="category-header">
        <span className="category-name" style={{ color: getCategoryColor(item.category) }}>
          {item.category}
        </span>
        <span className="category-budget">${item.budgeted.toFixed(2)}</span>
      </div>
      <div className="category-details">
        <span>Spent: ${item.spent.toFixed(2)}</span>
        <span>Remaining: ${item.remaining.toFixed(2)}</span>
      </div>
      <div className="category-progress-bar">
        <motion.div
          className="category-progress-bar-inner"
          style={{
            width: `${getSpentPercentage(item)}%`,
            backgroundColor: getCategoryColor(item.category),
          }}
          initial={{ width: 0 }}
          animate={{ width: `${getSpentPercentage(item)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

export default BudgetItem;
