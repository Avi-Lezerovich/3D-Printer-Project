import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTasks, FaUserTie, FaFlagCheckered, FaMoneyBillWave, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import TaskManagement from './TaskManagement';
import ProjectShowcase from './components/ProjectShowcase';
import Milestones from './components/Milestones'; // <-- IMPORTING

// --- MOCK DATA & CONFIG ---
const TABS = [
  { id: 'tasks', label: 'Task Management', icon: FaTasks, component: TaskManagement },
  { id: 'showcase', label: 'Project Showcase', icon: FaUserTie, component: ProjectShowcase },
  { id: 'milestones', label: 'Milestones', icon: FaFlagCheckered, component: Milestones }, // <-- ADDING COMPONENT
  { id: 'budget', label: 'Budget', icon: FaMoneyBillWave },
  { id: 'inventory', label: 'Inventory', icon: FaBoxOpen },
  { id: 'analytics', label: 'Analytics', icon: FaChartLine },
];

// --- STYLES ---
const styles = {
  mainPanel: `
    bg-gray-900/60 backdrop-blur-sm 
    border border-cyan-400/30
    rounded-2xl shadow-2xl
    overflow-hidden
  `,
  tabButton: `
    flex-1 px-4 py-3 text-sm font-medium text-white/70
    transition-all duration-300
    hover:bg-white/10 hover:text-white
    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
  `,
  activeTab: `
    text-white font-semibold
  `,
  tabIndicator: `
    absolute bottom-0 h-1 bg-cyan-400 rounded-full
  `,
  contentBox: `
    p-6 md:p-8
  `,
};

// --- PLACEHOLDER COMPONENT ---
const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="text-white"
  >
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-white/80">
      This is a placeholder for the {title} feature.
      Future implementation will include detailed components and functionality as per the project analysis.
    </p>
  </motion.div>
);

// --- MAIN APP COMPONENT ---
const ProjectMgmtApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const ActiveComponent = () => {
    const tab = TABS.find(t => t.id === activeTab);
    const ComponentToRender = tab?.component || (() => <PlaceholderComponent title={tab?.label || 'Component'} />);
    return <ComponentToRender />;
  };

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white font-sans"
      style={{ padding: 'clamp(1rem, 4vw, 2rem)' }} // Fluid padding
    >
      <header className="mb-8 text-center">
        <h1 
          className="font-bold text-white"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }} // Fluid typography
        >
          Project Management Hub
        </h1>
        <p 
          className="text-white/60 mt-2"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }} // Fluid typography
        >
          3D Printer Restoration Project
        </p>
      </header>

      <main className={`w-full max-w-7xl mx-auto ${styles.mainPanel}`}>
        <nav className="flex items-center border-b border-white/20 relative">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <tab.icon className="text-lg" />
                <span className="hidden md:inline">{tab.label}</span>
              </div>
            </button>
          ))}
          <motion.div
            className={styles.tabIndicator}
            layoutId="tab-indicator"
            initial={false}
            animate={{
              x: `${(TABS.findIndex(t => t.id === activeTab) / TABS.length) * 100}%`,
              width: `${100 / TABS.length}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </nav>

        <div className={styles.contentBox}>
          <AnimatePresence mode="wait">
            <ActiveComponent />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ProjectMgmtApp;