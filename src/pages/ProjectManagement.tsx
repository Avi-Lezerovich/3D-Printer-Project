import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();
  const tabRefs = useRef<Record<ActiveTab, HTMLButtonElement | null>>({
    overview: null,
    budget: null,
    inventory: null,
    analytics: null,
  });

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
  const tabListId = 'pm-tablist';

  return (
    <div className="project-management-container">
      <a href="#pm-main" className="skip-link">Skip to main content</a>
      {/* Modern Tab Navigation */}
      <motion.nav 
        className="project-management-nav"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="nav-container">
          <div
            className="nav-tabs"
            role="tablist"
            aria-label="Project Management Sections"
            id={tabListId}
          >
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                whileHover={{ 
                  scale: prefersReducedMotion ? 1 : 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                style={{
                  '--tab-color': tab.color
                } as React.CSSProperties}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onKeyDown={(e) => {
                  const order: ActiveTab[] = ['overview', 'budget', 'inventory', 'analytics'];
                  const currentIndex = order.indexOf(activeTab);
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = order[(currentIndex + 1) % order.length];
                    tabRefs.current[next]?.focus();
                    setActiveTab(next);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = order[(currentIndex - 1 + order.length) % order.length];
                    tabRefs.current[prev]?.focus();
                    setActiveTab(prev);
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    tabRefs.current.overview?.focus();
                    setActiveTab('overview');
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    tabRefs.current.analytics?.focus();
                    setActiveTab('analytics');
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabChange(tab.id);
                  }
                }}
              >
                <span className="tab-icon" aria-hidden>{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Content Section with Enhanced Transitions */}
      <div className="project-content-section" id="pm-main" role="main" aria-describedby="pm-desc">
        <p id="pm-desc" className="visually-hidden">Use left and right arrow keys to switch between tabs.</p>
        {/* Tab Content */}
        <div className="tab-content-wrapper">
          {isLoading ? (
            <motion.div 
              className="loading-state"
              role="status"
              aria-live="polite"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner"></div>
              <p>Loading {currentTab?.label}...</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
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
