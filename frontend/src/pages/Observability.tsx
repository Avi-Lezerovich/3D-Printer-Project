import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { MetricsPanel } from '../features/metrics/MetricsPanel';
import { AuditLogPanel } from '../features/audit/AuditLogPanel';
import Protected from '../core/components/Protected';
import { Activity, BarChart3, Shield, Clock, AlertCircle, TrendingUp } from 'lucide-react';

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

const ObservabilityContent: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();

  const metrics = [
    {
      title: 'System Uptime',
      value: '99.8%',
      change: '+0.2%',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'API Response Time',
      value: '124ms',
      change: '-12ms',
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'Active Sessions',
      value: '1',
      change: 'Current',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Error Rate',
      value: '0.02%',
      change: '-0.01%',
      icon: AlertCircle,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Header */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center mb-2">
              <BarChart3 className="w-8 h-8 text-blue-400 mr-3" />
              System Observability
            </h1>
            <p className="text-slate-400">Monitor system performance, metrics, and audit logs</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Overview Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const colorClasses = {
              green: 'text-green-400 bg-green-500/10 border-green-500/20',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
            };

            return (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 hover:bg-slate-700/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${
                    metric.change.startsWith('+') || metric.change.startsWith('-') 
                      ? metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      : 'text-slate-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-slate-400 text-sm mb-1">{metric.title}</h3>
                <p className="text-white text-2xl font-semibold">{metric.value}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Metrics Panel */}
          <motion.div 
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Performance Metrics</h2>
                  <p className="text-sm text-slate-400">Real-time system performance data</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <MetricsPanel />
            </div>
          </motion.div>

          {/* Audit Log Panel */}
          <motion.div 
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Audit Logs</h2>
                  <p className="text-sm text-slate-400">Security and activity monitoring</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <AuditLogPanel />
            </div>
          </motion.div>
        </div>

        {/* Additional System Info */}
        <motion.div 
          className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
          variants={itemVariants}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
            System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Environment</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Node.js Version:</span>
                  <span className="text-white">v18.17.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">React Version:</span>
                  <span className="text-white">v18.2.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Build:</span>
                  <span className="text-white">Production</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Memory Usage:</span>
                  <span className="text-white">124 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">CPU Usage:</span>
                  <span className="text-white">2.1%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Load Average:</span>
                  <span className="text-white">0.45</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Database:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Connected</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cache:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Healthy</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">API:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function ObservabilityPage() {
  return (
    <Protected>
      <ObservabilityContent />
    </Protected>
  );
}
