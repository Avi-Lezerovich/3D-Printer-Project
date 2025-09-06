import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Settings, Upload, Camera, TrendingUp,
  RefreshCw, Keyboard, Power, Zap
} from 'lucide-react';
import { useControlPanelShortcuts } from '../../features/printer/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../../shared/components/accessibility';

// Import existing sub-components
import ControlsSection from '../../pages/control-panel/ControlsSection';
import FileUploadSection from '../../pages/control-panel/FileUploadSection';
import QueueSection from '../../pages/control-panel/QueueSection';
import ChartSection from '../../pages/control-panel/ChartSection';
import WebcamSection from '../../pages/control-panel/WebcamSection';

// Import new enhanced components
import { StatusBar } from './components/StatusBar';
import { TabButton } from './components/TabButton';
import { QuickActionButton } from './components/QuickActionButton';

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

interface ControlPanelContainerProps {
  isDemo?: boolean;
}

/**
 * Enhanced Professional Control Panel Container Component
 * 
 * Improvements:
 * - Better component structure and separation of concerns
 * - Enhanced UI with modern glassmorphism design
 * - Improved accessibility and keyboard navigation
 * - Better error handling and loading states
 * - Responsive design optimizations
 * - Performance optimizations with proper memoization
 * - Demo mode support for view-only access
 */
export const ControlPanelContainer: React.FC<ControlPanelContainerProps> = ({ isDemo = false }) => {
  const { sidebarCollapsed, connected, status, hotend, bed } = useAppStore();
  const [activeTab, setActiveTab] = useState('controls');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleConnection = useCallback(() => {
    
    // Add actual connection toggle logic here
  }, []);

  const handleEmergencyStop = useCallback(() => {
    
    // Add actual emergency stop logic here
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const { shortcuts } = useControlPanelShortcuts(
    handleRefresh,
    handleToggleConnection,
    handleEmergencyStop,
    handleTabChange
  );

  // Handle keyboard help shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' || (event.key === 'k' && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs = [
    { 
      id: 'controls', 
      label: 'Controls', 
      icon: Settings,
      description: 'Temperature and manual controls',
      color: 'orange'
    },
    { 
      id: 'monitor', 
      label: 'Live View', 
      icon: Camera,
      description: 'Real-time printer monitoring',
      color: 'green'
    },
    { 
      id: 'charts', 
      label: 'Analytics', 
      icon: TrendingUp,
      description: 'Performance metrics and insights',
      color: 'purple'
    },
    { 
      id: 'files', 
      label: 'Files', 
      icon: Upload,
      description: 'Upload and manage print files',
      color: 'cyan'
    },
    { 
      id: 'queue', 
      label: 'Queue', 
      icon: TrendingUp,
      description: 'Print job queue management',
      color: 'pink'
    }
  ];

  const renderContent = () => {
    const contentWrapperClass = `
      relative min-h-[600px] rounded-3xl overflow-hidden
      bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30
      backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/20
    `;

    const getHeaderClass = (color: string) => {
      const baseClass = "flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-gradient-to-r";
      switch (color) {
        case 'orange':
          return `${baseClass} from-orange-500/10 to-orange-600/5`;
        case 'green':
          return `${baseClass} from-green-500/10 to-green-600/5`;
        case 'purple':
          return `${baseClass} from-purple-500/10 to-purple-600/5`;
        case 'cyan':
          return `${baseClass} from-cyan-500/10 to-cyan-600/5`;
        case 'pink':
          return `${baseClass} from-pink-500/10 to-pink-600/5`;
        default:
          return `${baseClass} from-blue-500/10 to-blue-600/5`;
      }
    };

    switch (activeTab) {
      case 'controls':
        return (
          <motion.div 
            className={contentWrapperClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={getHeaderClass('orange')}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Printer Controls</h2>
                  <p className="text-sm text-slate-400">Temperature and manual controls</p>
                </div>
              </div>
              <QuickActionButton
                icon={RefreshCw}
                label="Refresh"
                onClick={handleRefresh}
                disabled={isLoading}
                tooltip="Refresh printer status"
              />
            </div>
            <div className="p-6">
              <ControlsSection isDemo={isDemo} />
            </div>
          </motion.div>
        );
        
      case 'monitor':
        return (
          <motion.div 
            className={contentWrapperClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={getHeaderClass('green')}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Camera className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Live Monitor</h2>
                  <p className="text-sm text-slate-400">Real-time printer monitoring</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  connected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {connected ? 'Live Stream' : 'Offline'}
                </div>
              </div>
            </div>
            <div className="p-6">
              <WebcamSection />
            </div>
          </motion.div>
        );
        
      case 'charts':
        return (
          <motion.div 
            className={contentWrapperClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={getHeaderClass('purple')}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-sm text-slate-400">Performance metrics and insights</p>
                </div>
              </div>
              <QuickActionButton
                icon={RefreshCw}
                label="Refresh"
                onClick={handleRefresh}
                tooltip="Refresh analytics data"
              />
            </div>
            <div className="p-6">
              <ChartSection />
            </div>
          </motion.div>
        );
        
      case 'files':
        return (
          <motion.div 
            className={contentWrapperClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={getHeaderClass('cyan')}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">File Management</h2>
                  <p className="text-sm text-slate-400">Upload and manage print files</p>
                </div>
              </div>
              <QuickActionButton
                icon={Upload}
                label="Upload File"
                onClick={() => {}}
                tooltip="Upload new print file"
              />
            </div>
            <div className="p-6">
              <FileUploadSection />
            </div>
          </motion.div>
        );
        
      case 'queue':
        return (
          <motion.div 
            className={contentWrapperClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={getHeaderClass('pink')}>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Print Queue</h2>
                  <p className="text-sm text-slate-400">Manage your print job queue</p>
                </div>
              </div>
              <QuickActionButton
                icon={RefreshCw}
                label="Refresh"
                onClick={handleRefresh}
                tooltip="Refresh queue status"
              />
            </div>
            <div className="p-6">
              <QueueSection />
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`
      transition-all duration-300 ease-in-out min-h-screen
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      ${sidebarCollapsed ? 'ml-[70px]' : 'ml-[280px]'} max-lg:ml-0
    `}>
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Status Bar */}
          <StatusBar 
            connected={connected}
            status={status}
            hotend={hotend}
            bed={bed}
          />
          
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-sm p-2 rounded-3xl border border-white/10">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={handleTabChange}
                  color={tab.color}
                  description={tab.description}
                />
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <QuickActionButton
                icon={RefreshCw}
                label="Refresh"
                onClick={handleRefresh}
                disabled={isLoading}
                tooltip="Refresh connection (Ctrl+R)"
              />
              
              <QuickActionButton
                icon={Power}
                label="Emergency Stop"
                onClick={handleEmergencyStop}
                variant="danger"
                tooltip="Emergency stop (Ctrl+E)"
              />
              
              <QuickActionButton
                icon={Keyboard}
                label="Shortcuts"
                onClick={() => setShowKeyboardHelp(true)}
                tooltip="Show keyboard shortcuts (?)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          {renderContent()}
        </motion.div>
      </motion.div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={shortcuts}
      />

      {/* Emergency Stop FAB */}
      <motion.button
        onClick={handleEmergencyStop}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-2xl shadow-red-500/25 border border-red-500/50 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Emergency Stop (Ctrl+E)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Zap className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
