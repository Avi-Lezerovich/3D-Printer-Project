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
      case 'green':
        return isActive 
          ? `${baseClasses} bg-green-500/20 border-green-400/50` 
          : `${baseClasses} hover:bg-green-500/10`;
      case 'amber':
        return isActive 
          ? `${baseClasses} bg-amber-500/20 border-amber-400/50` 
          : `${baseClasses} hover:bg-amber-500/10`;
      case 'purple':
        return isActive 
          ? `${baseClasses} bg-purple-500/20 border-purple-400/50` 
          : `${baseClasses} hover:bg-purple-500/10`;
      case 'red':
        return isActive 
          ? `${baseClasses} bg-red-500/20 border-red-400/50` 
          : `${baseClasses} hover:bg-red-500/10`;
      default:
        return isActive 
          ? `${baseClasses} bg-blue-500/20 border-blue-400/50` 
          : `${baseClasses} hover:bg-blue-500/10`;
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
