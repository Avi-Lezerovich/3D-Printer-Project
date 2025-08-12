import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { TaskManagement, BudgetTracker, Inventory, Analytics, ActiveTab } from './project-management';
import '../styles/project-management.css';

interface TabInfo {
  id: ActiveTab;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export default function ProjectManagement() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab;
    if (tabParam && ['overview', 'budget', 'inventory', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs: TabInfo[] = [
    { 
      id: 'overview', 
      label: 'Tasks', 
      icon: '📋', 
      description: 'Manage project tasks and workflows',
      color: '#3b82f6'
    },
    { 
      id: 'budget', 
      label: 'Budget', 
      icon: '💰', 
      description: 'Track expenses and financial planning',
      color: '#10b981'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: '📦', 
      description: 'Monitor supplies and materials',
      color: '#f59e0b'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: '📊', 
      description: 'View insights and performance metrics',
      color: '#8b5cf6'
    }
  ];

  const handleTabChange = (tabId: ActiveTab) => {
    if (tabId === activeTab) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsLoading(false);
    }, 150);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="project-management-container">
      {/* Enhanced Header Section */}
      <motion.div 
        className="project-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Project Management
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Streamlined project tracking, resource management, and analytics for professional 3D printing operations
            </motion.p>
          </div>
          
          <motion.div 
            className="hero-metrics"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="primary-metric">
              <div className="metric-value">87%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modern Tab Navigation */}
      <motion.nav 
        className="project-management-nav"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="nav-container">
          <div className="nav-tabs">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  '--tab-color': tab.color
                } as React.CSSProperties}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Content Section with Enhanced Transitions */}
      <div className="project-content-section">
        {/* Current Tab Info */}
        {currentTab && (
          <motion.div 
            className="current-tab-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tab-info-content">
              <span className="tab-info-icon" style={{ color: currentTab.color }}>
                {currentTab.icon}
              </span>
              <div className="tab-info-text">
                <h2 className="tab-info-title">{currentTab.label}</h2>
                <p className="tab-info-description">{currentTab.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <div className="tab-content-wrapper">
          {isLoading ? (
            <motion.div 
              className="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner"></div>
              <p>Loading {currentTab?.label}...</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && <TaskManagement />}
                {activeTab === 'budget' && <BudgetTracker />}
                {activeTab === 'inventory' && <Inventory />}
                {activeTab === 'analytics' && <Analytics />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
