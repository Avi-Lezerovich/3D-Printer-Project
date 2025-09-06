import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  tooltip,
  size = 'md'
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'border transition-all duration-200';
    
    if (disabled) {
      return `${baseClasses} bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed`;
    }

    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-300`;
      case 'success':
        return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-300`;
      default:
        return `${baseClasses} bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600 hover:text-white`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-xs';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-2.5 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  return (
    <motion.button
      className={`
        rounded-xl backdrop-blur-sm flex items-center space-x-2 font-medium
        ${getVariantClasses()}
        ${getSizeClasses()}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      title={tooltip}
    >
      <Icon size={getIconSize()} className="flex-shrink-0" />
      <span>{label}</span>
    </motion.button>
  );
};
