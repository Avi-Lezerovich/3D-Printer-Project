/**
 * ManagementShell
 * Unified container composing navigation + tab panels using modular stores
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectHub } from './projectHub';
import BudgetOverview from '../budget/components/BudgetOverview';
import { TaskList } from '../../../pages/project-management/components/TaskList';
import { AnalyticsDashboard } from '../../../pages/project-management/components/ImprovedAnalyticsDashboard';
// Inventory placeholder

export type HubTab = 'analytics' | 'tasks' | 'budget' | 'inventory';

const TAB_CONFIG: { id: HubTab; label: string; icon: string; desc: string }[] = [
  { id: 'analytics', label: 'Analytics', icon: '📊', desc: 'Insights & KPIs' },
  { id: 'tasks', label: 'Tasks', icon: '✅', desc: 'Plan & track work' },
  { id: 'budget', label: 'Budget', icon: '💰', desc: 'Financial tracking' },
  { id: 'inventory', label: 'Inventory', icon: '📦', desc: 'Materials & stock' },
];

export const ManagementShell: React.FC = () => {
  const { initialize, loading, error } = useProjectHub();
  const [active, setActive] = useState<HubTab>('analytics');
  const [scrolled, setScrolled] = useState(false);
  const [initializationTimeout, setInitializationTimeout] = useState(false);

  useEffect(() => { 
    console.info('ManagementShell initializing...');
    
    // Initialize with a timeout to prevent getting stuck
    Promise.race([
      initialize(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), 8000);
      })
    ]).catch(err => {
      console.error('ManagementShell initialization error:', err);
      setInitializationTimeout(true);
    });
    
    // Set a fallback timeout
    const timeout = setTimeout(() => {
      console.warn('Fallback timeout - forcing component to render with demo data');
      setInitializationTimeout(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [initialize]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const render = () => {
    switch (active) {
      case 'analytics': return <AnalyticsDashboard />;
      case 'tasks': return <TaskList />;
      case 'budget': return <BudgetOverview />;
      case 'inventory': return <div className="placeholder">Inventory module coming soon</div>;
    }
  };

  return (
    <div className="pm-shell">
      <header className={`pm-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="header-content">
            <h1 className="shell-title">Project Management Hub</h1>
            <p className="shell-subtitle">Unified control across tasks, budget & more</p>
          </div>
          <nav className="nav-tabs" role="tablist">
            {TAB_CONFIG.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={active === t.id}
                className={`nav-tab ${active === t.id ? 'active' : ''}`}
                onClick={() => setActive(t.id)}
              >
                <div className="tab-content">
                  <div className="tab-header">
                    <span className="tab-icon" aria-hidden>{t.icon}</span>
                    <span className="tab-label">{t.label}</span>
                  </div>
                  <p className="tab-description">{t.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="pm-main">
        <div className="content-container">
          {error && (
            <div className="hub-error">
              <p><strong>Error:</strong> {error}</p>
              <p className="error-hint">Check the browser console for more details. Make sure the backend server is running.</p>
              <button 
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
          {initializationTimeout && !error && (
            <div className="hub-warning">
              <p><strong>Loading timed out.</strong> Some data may not be available.</p>
              <p className="warning-hint">The dashboard will still function with partial data.</p>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="tab-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {(loading && !initializationTimeout) ? (
                <div className="hub-loading">
                  <div className="spinner" />
                  <span>Loading data…</span>
                </div>
              ) : render()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ManagementShell;
