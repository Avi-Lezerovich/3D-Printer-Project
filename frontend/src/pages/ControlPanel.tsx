import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Monitor, Thermometer, Play, Upload, Clock, Camera, 
  Activity, Wifi, WifiOff, AlertCircle, CheckCircle,
  Settings, RefreshCw, Power
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
      label: 'Connection',
      value: connected ? 'Online' : 'Offline',
      icon: connected ? Wifi : WifiOff,
      color: connected ? 'green' : 'red'
    },
    {
      label: 'Status',
      value: status === 'idle' ? 'Ready' : status.charAt(0).toUpperCase() + status.slice(1),
      icon: status === 'printing' ? Play : status === 'error' ? AlertCircle : CheckCircle,
      color: status === 'printing' ? 'blue' : status === 'error' ? 'red' : 'green'
    },
    {
      label: 'Hotend',
      value: `${hotend}°C`,
      icon: Thermometer,
      color: hotend > 180 ? 'red' : hotend > 50 ? 'orange' : 'blue'
    },
    {
      label: 'Bed',
      value: `${bed}°C`,
      icon: Thermometer,
      color: bed > 60 ? 'red' : bed > 30 ? 'orange' : 'blue'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 text-blue-400 mr-2" />
                Printer Status
              </h3>
              <StatusSection />
            </div>
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 text-blue-400 mr-2" />
                Quick Controls
              </h3>
              <ControlsSection />
            </div>
          </div>
        );
      case 'controls':
        return (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 text-blue-400 mr-2" />
              Printer Controls
            </h3>
            <ControlsSection />
          </div>
        );
      case 'files':
        return (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 text-blue-400 mr-2" />
              File Management
            </h3>
            <FileUploadSection />
          </div>
        );
      case 'queue':
        return (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              Print Queue
            </h3>
            <QueueSection />
          </div>
        );
      case 'monitor':
        return (
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Camera className="w-5 h-5 text-blue-400 mr-2" />
              Live Monitor
            </h3>
            <WebcamSection />
          </div>
        );
      case 'charts':
        return (
          <div className="bg-slate-700/30 rounded-lg p-6">
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
      {/* Fixed Navigation */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center">
                <Monitor className="w-7 h-7 text-blue-400 mr-3" />
                3D Printer Control Panel
              </h1>
              <p className="text-slate-400 text-sm">Monitor and control your 3D printer remotely</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                title="Refresh connection"
              >
                <RefreshCw className="w-5 h-5 text-slate-300" />
              </button>
              <button 
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                title="Emergency stop"
              >
                <Power className="w-5 h-5 text-red-400" />
              </button>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-slate-300">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl border border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="pt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              green: 'text-green-400 bg-green-500/10 border-green-500/20',
              red: 'text-red-400 bg-red-500/10 border-red-500/20',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
            };

            return (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-white text-xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
          variants={itemVariants}
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </div>
  );
}
