import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Activity, Settings, Upload, Clock, Camera, TrendingUp,
  Wifi, WifiOff, AlertCircle, CheckCircle, Flame, Thermometer,
  RefreshCw, Power, Play, Pause, Keyboard
} from 'lucide-react';
import { 
  ControlsSection,
  FileUploadSection,
  QueueSection,
  ChartSection,
  WebcamSection
} from '../features/printer';
import { KeyboardShortcutsHelp } from '../shared/components/accessibility';
import { useControlPanelShortcuts } from '../features/printer/hooks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 32, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      mass: 0.8
    }
  }
};

export default function ControlPanelPage() {
  const { sidebarCollapsed, connected, status, hotend, bed } = useAppStore();
  const [activeTab, setActiveTab] = useState('controls');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing connection and data...');
    // Add actual refresh logic here
  }, []);

  // Set up keyboard shortcuts
  useControlPanelShortcuts({
    onRefresh: handleRefresh,
    onShowHelp: () => setShowKeyboardHelp(true),
  });

  return (
    <div className={`control-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="control-panel-header">
        <div className="header-left">
          <h1 className="page-title">
            <Activity className="w-6 h-6" />
            Control Panel
          </h1>
          <div className="connection-status">
            {connected ? (
              <div className="status-connected">
                <Wifi className="w-4 h-4" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="status-disconnected">
                <WifiOff className="w-4 h-4" />
                <span>Disconnected</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={handleRefresh}
            className="btn-secondary"
            title="Refresh connection and data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="btn-secondary"
            title="Show keyboard shortcuts (K)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      <motion.div
        className="control-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <ControlsSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FileUploadSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <QueueSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WebcamSection />
        </motion.div>
      </motion.div>

      {showKeyboardHelp && (
        <KeyboardShortcutsHelp
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}
    </div>
  );
}