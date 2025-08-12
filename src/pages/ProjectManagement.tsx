import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { TaskManagement, BudgetTracker, Inventory, Analytics, ActiveTab } from './project-management';
import '../styles/project-management.css';

export default function ProjectManagement() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab;
    if (tabParam && ['overview', 'budget', 'inventory', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <motion.div 
      className="project-management"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Project Management Hub
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Comprehensive project tracking and resource management for 3D printing projects
        </motion.p>
      </div>

      <nav className="tab-navigation">
        {[
          { id: 'overview' as const, label: 'Task Management', icon: '📋' },
          { id: 'budget' as const, label: 'Budget Tracker', icon: '💰' },
          { id: 'inventory' as const, label: 'Inventory', icon: '📦' },
          { id: 'analytics' as const, label: 'Analytics', icon: '📊' }
        ].map((tab, index) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + (index * 0.1), duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="tab-content-container">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <TaskManagement />}
          {activeTab === 'budget' && <BudgetTracker />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'analytics' && <Analytics />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
