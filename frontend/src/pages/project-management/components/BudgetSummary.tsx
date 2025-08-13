import { motion } from 'framer-motion';

interface BudgetSummaryProps {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  spentPercentage: number;
}

const BudgetSummary = ({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  spentPercentage,
}: BudgetSummaryProps) => {
  return (
    <motion.div
      className="budget-summary"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="summary-item">
        <span className="summary-label">Total Budget</span>
        <span className="summary-value">${totalBudgeted.toFixed(2)}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Total Spent</span>
        <span className="summary-value">${totalSpent.toFixed(2)}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Total Remaining</span>
        <span className="summary-value">${totalRemaining.toFixed(2)}</span>
      </div>
      <div className="summary-progress">
        <div className="progress-bar-background">
          <motion.div
            className="progress-bar-foreground"
            style={{ width: `${spentPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="progress-label">{spentPercentage.toFixed(1)}% Spent</span>
      </div>
    </motion.div>
  );
};

export default BudgetSummary;
