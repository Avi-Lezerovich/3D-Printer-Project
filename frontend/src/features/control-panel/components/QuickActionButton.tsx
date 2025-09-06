import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltip?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  tooltip
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/50';
      case 'danger':
        return 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30 hover:bg-slate-600/50 hover:border-slate-500/50';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        glass-button p-3 rounded-xl border transition-all duration-200
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      title={tooltip || label}
    >
      <Icon className="w-5 h-5" />
      <span className="sr-only">{label}</span>
    </motion.button>
  );
};
