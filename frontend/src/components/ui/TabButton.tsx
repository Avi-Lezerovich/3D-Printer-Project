import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (tabId: string) => void;
  color?: string;
  description?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
  color = 'blue',
  description
}) => {
  const getColorClasses = () => {
    const baseClasses = isActive
      ? 'text-white shadow-lg'
      : 'text-slate-400 hover:text-white';

    switch (color) {
      case 'success':
        return isActive
          ? `${baseClasses} bg-success/20 border-success/50`
          : `${baseClasses} hover:bg-success/10`;
      case 'warning':
        return isActive
          ? `${baseClasses} bg-warning/20 border-warning/50`
          : `${baseClasses} hover:bg-warning/10`;
      case 'error':
        return isActive
          ? `${baseClasses} bg-error/20 border-error/50`
          : `${baseClasses} hover:bg-error/10`;
      case 'info':
        return isActive
          ? `${baseClasses} bg-info/20 border-info/50`
          : `${baseClasses} hover:bg-info/10`;
      default:
        return isActive
          ? `${baseClasses} bg-primary-500/20 border-primary-500/50`
          : `${baseClasses} hover:bg-primary-500/10`;
    }
  };

  return (
    <motion.button
      className={`
        relative px-4 py-2.5 rounded-2xl border transition-all duration-200 
        flex items-center space-x-2 min-w-[120px] justify-center
        ${isActive ? 'border-white/20' : 'border-transparent hover:border-white/10'}
        ${getColorClasses()}
      `}
      onClick={() => onClick(id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={description}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-white/10"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
    </motion.button>
  );
};
