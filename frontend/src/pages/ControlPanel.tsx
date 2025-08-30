import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Activity, Settings, Upload, Clock, Camera, TrendingUp,
  Wifi, WifiOff, AlertCircle, CheckCircle, Flame, Thermometer,
  RefreshCw, Power, Play, Pause, Keyboard
} from 'lucide-react';
import { useControlPanelShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from '../components/ui/KeyboardShortcutsHelp';
import ControlsSection from './control-panel/ControlsSection';
import FileUploadSection from './control-panel/FileUploadSection';
import QueueSection from './control-panel/QueueSection';
import ChartSection from './control-panel/ChartSection';
import WebcamSection from './control-panel/WebcamSection';

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

export default function ControlPanel() {
  const { sidebarCollapsed, connected, status, hotend, bed } = useAppStore();
  const [activeTab, setActiveTab] = useState('controls');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing connection and data...');
    // Add actual refresh logic here
  }, []);

  const handleToggleConnection = useCallback(() => {
    console.log('Toggling printer connection...');
    // Add actual connection toggle logic here
  }, []);

  const handleEmergencyStop = useCallback(() => {
    console.log('Emergency stop triggered!');
    // Add actual emergency stop logic here
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const { shortcuts } = useControlPanelShortcuts(
    handleRefresh,
    handleToggleConnection,
    handleEmergencyStop,
    handleTabChange,
    activeTab
  );

  // Handle keyboard help shortcut
  useEffect(() => {
    const handleShowKeyboardHelp = () => setShowKeyboardHelp(true);
    document.addEventListener('showKeyboardHelp', handleShowKeyboardHelp);
    return () => document.removeEventListener('showKeyboardHelp', handleShowKeyboardHelp);
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
      description: 'Performance metrics and charts',
      color: 'purple'
    },
    { 
      id: 'files', 
      label: 'Files', 
      icon: Upload,
      description: 'File management and uploads',
      color: 'cyan'
    },
    { 
      id: 'queue', 
      label: 'Queue', 
      icon: Clock,
      description: 'Print queue management',
      color: 'pink'
    }
  ];

  const quickStats = [
    {
      id: 'connection',
      label: 'Connection',
      value: connected ? 'Connected' : 'Disconnected',
      icon: connected ? Wifi : WifiOff,
      color: connected ? 'green' : 'red',
      status: connected ? 'success' : 'error',
      trend: connected ? 'stable' : 'down',
      badge: connected ? 'Online' : 'Offline'
    },
    {
      id: 'status',
      label: 'Printer Status',
      value: status === 'idle' ? 'Ready' : 
             status === 'printing' ? 'Printing' :
             status === 'error' ? 'Error' :
             status === 'paused' ? 'Paused' : 'Ready',
      icon: status === 'printing' ? Play : 
            status === 'error' ? AlertCircle : 
            status === 'paused' ? Pause :
            CheckCircle,
      color: status === 'printing' ? 'blue' : 
             status === 'error' ? 'red' : 
             status === 'paused' ? 'orange' : 'green',
      status: status === 'printing' ? 'active' : 
              status === 'error' ? 'error' : 
              status === 'paused' ? 'warning' : 'success',
      trend: status === 'printing' ? 'up' : 'stable',
      badge: status === 'printing' ? 'Active' : status === 'error' ? 'Error' : 'Ready'
    },
    {
      id: 'hotend',
      label: 'Hotend Temp',
      value: `${hotend}°C`,
      icon: Flame,
      color: hotend > 200 ? 'red' : hotend > 100 ? 'orange' : 'blue',
      status: hotend > 250 ? 'error' : hotend > 200 ? 'warning' : 'normal',
      trend: hotend > 180 ? 'up' : hotend > 50 ? 'stable' : 'down',
      badge: hotend > 200 ? 'Hot' : hotend > 50 ? 'Warm' : 'Cool',
      target: status === 'printing' ? 210 : 0
    },
    {
      id: 'bed',
      label: 'Bed Temp',
      value: `${bed}°C`,
      icon: Thermometer,
      color: bed > 80 ? 'red' : bed > 40 ? 'orange' : 'blue',
      status: bed > 100 ? 'error' : bed > 80 ? 'warning' : 'normal',
      trend: bed > 60 ? 'up' : bed > 30 ? 'stable' : 'down',
      badge: bed > 60 ? 'Hot' : bed > 30 ? 'Warm' : 'Cool',
      target: status === 'printing' ? 65 : 0
    }
  ];

  const renderContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const tabColor = currentTab?.color || 'blue';
    
    const contentWrapperClass = `
      relative min-h-[600px] rounded-2xl overflow-hidden
      bg-gradient-to-br from-slate-800/40 via-slate-900/30 to-slate-800/20
      backdrop-blur-xl border border-white/10
      shadow-2xl shadow-black/20
    `;

    const headerClass = `
      flex items-center justify-between p-6 pb-4 
      border-b border-white/10 bg-gradient-to-r 
      from-${tabColor}-500/5 to-${tabColor}-600/5
    `;

    switch (activeTab) {
      case 'controls':
        return (
          <div className={contentWrapperClass}>
            <div className={headerClass}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Printer Controls</h2>
                  <p className="text-sm text-slate-400">Temperature and manual controls</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="glass-button p-2">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ControlsSection />
            </div>
          </div>
        );
        
      case 'monitor':
        return (
          <div className={contentWrapperClass}>
            <div className={headerClass}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
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
          </div>
        );
        
      case 'charts':
        return (
          <div className={contentWrapperClass}>
            <div className={headerClass}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-sm text-slate-400">Performance metrics and insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="glass-button p-2">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ChartSection />
            </div>
          </div>
        );
        
      case 'files':
        return (
          <div className={contentWrapperClass}>
            <div className={headerClass}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">File Management</h2>
                  <p className="text-sm text-slate-400">Upload and manage print files</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="glass-button px-4 py-2 text-sm font-medium">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </button>
              </div>
            </div>
            <div className="p-6">
              <FileUploadSection />
            </div>
          </div>
        );
        
      case 'queue':
        return (
          <div className={contentWrapperClass}>
            <div className={headerClass}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Clock className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Print Queue</h2>
                  <p className="text-sm text-slate-400">Manage your print jobs</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-medium">
                  3 items queued
                </div>
              </div>
            </div>
            <div className="p-6">
              <QueueSection />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Enhanced Header */}
      <div 
        className={`fixed top-0 z-50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Enhanced Navigation Tabs */}
              <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group relative flex items-center space-x-3 px-4 py-3 rounded-xl 
                        font-semibold transition-all duration-300 text-sm
                        ${isActive 
                          ? `bg-${tab.color}-500/20 text-${tab.color}-300 border border-${tab.color}-500/30 shadow-lg shadow-${tab.color}-500/10` 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                      <span className="hidden sm:block">{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Enhanced Right Controls */}
              <div className="flex items-center space-x-4">
                <button 
                  className="glass-button p-3 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 transition-all"
                  title="Refresh connection"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                
                <button 
                  className="glass-button p-3 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all"
                  title="Emergency stop"
                >
                  <Power className="w-5 h-5" />
                </button>
                
                <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border transition-all ${
                  connected 
                    ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-red-400'}`} />
                  <span className="font-semibold text-sm">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {quickStats.map((stat) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/10',
              red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/10',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
              orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10'
            };

            return (
              <motion.div
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-900/30 to-slate-800/20 backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/20"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          stat.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          stat.status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          stat.status === 'warning' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          stat.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {stat.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Main Content */}
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

      {/* Keyboard shortcuts indicator */}
      <motion.button
        onClick={() => setShowKeyboardHelp(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-var(--accent) text-white shadow-lg hover:shadow-xl transition-shadow z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Show keyboard shortcuts (Press ?)"
      >
        <Keyboard size={20} />
      </motion.button>
    </div>
  );
}
