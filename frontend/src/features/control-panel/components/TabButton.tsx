import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (id: string) => void;
  color: string;
  description?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  id, 
  label, 
  icon: Icon, 
  isActive, 
  onClick, 
  color,
  description 
}) => {
  return (
    <motion.button
      onClick={() => onClick(id)}
      className={`
        group relative flex items-center space-x-3 px-6 py-4 rounded-2xl 
        font-semibold transition-all duration-300 text-sm min-w-[140px]
        ${isActive 
          ? `bg-${color}-500/20 text-${color}-300 border border-${color}-500/30 shadow-lg shadow-${color}-500/10` 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
        }
      `}
      whileHover={{ scale: isActive ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={description}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:block">{label}</span>
      
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      {/* Subtle glow effect for active tab */}
      {isActive && (
        <div className={`absolute inset-0 rounded-2xl bg-${color}-500/5 blur-xl`} />
      )}
    </motion.button>
  );
};
