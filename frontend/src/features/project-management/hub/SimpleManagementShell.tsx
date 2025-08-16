/**
 * Simple Project Management Shell - Debug Version
 * Minimal version that bypasses store loading issues for testing
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '../../../pages/project-management/components/ImprovedAnalyticsDashboard';

type SimpleTab = 'analytics' | 'tasks' | 'budget';

export const SimpleManagementShell: React.FC = () => {
  const [active, setActive] = useState<SimpleTab>('analytics');
  const [loading, setLoading] = useState(true);

  // Simple timeout to simulate loading and then show content
  useEffect(() => {
    const timer = setTimeout(() => {
      console.info('SimpleManagementShell: Loading timeout complete, showing dashboard');
      setLoading(false);
    }, 2000); // 2 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (active) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'tasks':
        return <div className="coming-soon">Tasks view coming soon...</div>;
      case 'budget':
        return <div className="coming-soon">Budget view coming soon...</div>;
      default:
        return <AnalyticsDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="simple-shell-loading">
        <div className="loading-container">
          <div className="spinner-large" />
          <h3>Loading Project Management...</h3>
          <p>This should only take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-management-shell">
      <header className="shell-header">
        <div className="header-title">
          <h1>Project Management Dashboard</h1>
          <p>3D Printer Project Analytics & Tracking</p>
        </div>
        
        <nav className="simple-nav">
          <button 
            className={`nav-button ${active === 'analytics' ? 'active' : ''}`}
            onClick={() => setActive('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`nav-button ${active === 'tasks' ? 'active' : ''}`}
            onClick={() => setActive('tasks')}
          >
            ✅ Tasks
          </button>
          <button 
            className={`nav-button ${active === 'budget' ? 'active' : ''}`}
            onClick={() => setActive('budget')}
          >
            💰 Budget
          </button>
        </nav>
      </header>

      <main className="shell-content">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};
