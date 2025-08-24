import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Monitor, Thermometer, Play, Upload, Clock, Camera, 
  Activity, Wifi, WifiOff, AlertCircle, CheckCircle,
  Settings, RefreshCw, Power, Flame, Zap
} from 'lucide-react';
import StatusSection from './control-panel/StatusSection';
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
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function ControlPanel() {
  const { sidebarCollapsed, connected, status, hotend, bed } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'controls', label: 'Controls', icon: Settings },
    { id: 'files', label: 'Files', icon: Upload },
    { id: 'queue', label: 'Queue', icon: Clock },
    { id: 'monitor', label: 'Monitor', icon: Camera },
    { id: 'charts', label: 'Charts', icon: Monitor },
  ];

  const quickStats = [
    {
      label: '', // Remove text label for connection, icon only
      value: connected ? 'Online' : 'Offline',
      icon: connected ? Wifi : WifiOff,
      color: connected ? 'green' : 'red',
      showLabel: false // Special flag for connection
    },
    {
      label: 'Status',
      value: status === 'idle' ? 'Ready' : 
             status === 'printing' ? 'Printing' :
             status === 'error' ? 'Error' :
             status === 'paused' ? 'Paused' : 'Ready', // Simplified without redundant "Optimal"
      icon: status === 'printing' ? Play : 
            status === 'error' ? AlertCircle : 
            status === 'paused' ? AlertCircle :
            CheckCircle,
      color: status === 'printing' ? 'blue' : status === 'error' ? 'red' : 'green'
    },
    {
      label: 'Hotend',
      value: `${hotend}°C`,
      icon: Flame, // Use flame icon instead of thermometer
      color: hotend > 180 ? 'red' : hotend > 50 ? 'orange' : 'blue'
    },
    {
      label: 'Bed',
      value: `${bed}°C`,
      icon: Zap, // Use bed/heating icon instead of thermometer  
      color: bed > 60 ? 'red' : bed > 30 ? 'orange' : 'blue'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <StatusSection />
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <ControlsSection />
              </div>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <WebcamSection />
            </div>
          </div>
        );
      case 'controls':
        return (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <ControlsSection />
          </div>
        );
      case 'files':
        return (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 text-blue-400 mr-2" />
              File Management
            </h3>
            <FileUploadSection />
          </div>
        );
      case 'queue':
        return (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              Print Queue
            </h3>
            <QueueSection />
          </div>
        );
      case 'monitor':
        return (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Camera className="w-5 h-5 text-blue-400 mr-2" />
              Live Monitor
            </h3>
            <WebcamSection />
          </div>
        );
      case 'charts':
        return (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Monitor className="w-5 h-5 text-blue-400 mr-2" />
              Temperature Charts
            </h3>
            <ChartSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Top Navigation */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl border border-slate-700/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              <button 
                className="p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors group"
                title="Refresh connection"
              >
                <RefreshCw className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </button>
              <button 
                className="p-2.5 rounded-lg bg-slate-700/50 hover:bg-red-500/20 transition-colors group"
                title="Emergency stop"
              >
                <Power className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
              </button>
              <div className="flex items-center space-x-2 text-sm px-3 py-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className={`font-medium ${connected ? 'text-green-300' : 'text-red-300'}`}>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/10',
              red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/10',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
              orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10'
            };

            return (
              <motion.div
                key={index}
                className="stats-card-enhanced"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="stats-card-glow" />
                <div className="stats-card-content">
                  <div className="stats-icon-container">
                    <div className={`stats-icon ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="stats-pulse-ring" />
                  </div>
                  <div className="stats-info">
                    {stat.showLabel !== false && <p className="stats-label">{stat.label}</p>}
                    <p className="stats-value">{stat.value}</p>
                    <div className="stats-trend">
                      {stat.color === 'green' && index === 1 && <span className="trend-up">● Ready</span>}
                      {stat.color === 'blue' && index === 1 && <span className="trend-stable">● Active</span>}
                      {stat.color === 'blue' && connected && index === 0 && <span className="trend-stable">● Connected</span>}
                      {stat.color === 'red' && !connected && index === 0 && <span className="trend-down">● Disconnected</span>}
                      {stat.color === 'red' && index === 1 && <span className="trend-down">⚠ Error</span>}
                      {stat.color === 'orange' && index > 1 && <span className="trend-warning">⚡ Heating</span>}
                      {stat.color === 'green' && index > 1 && <span className="trend-up">● Ready</span>}
                      {stat.color === 'blue' && index > 1 && <span className="trend-stable">● Cool</span>}
                      {stat.color === 'red' && index > 1 && <span className="trend-warning">🔥 Hot</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Main Content */}
        <motion.div 
          className="main-content-container"
          variants={itemVariants}
        >
          <div className="content-wrapper">
            <div className="content-header">
              <div className="content-breadcrumb">
                <span className="breadcrumb-item">Control Panel</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-item active">{tabs.find(t => t.id === activeTab)?.label}</span>
              </div>
              <div className="content-actions">
                <button className="action-btn-mini refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="action-btn-mini settings">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="content-body">
              {renderContent()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
