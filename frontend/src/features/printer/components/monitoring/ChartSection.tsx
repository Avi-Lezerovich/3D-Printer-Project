import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  TrendingUp, 
  Zap, 
  Activity, 
  Clock, 
  Layers, 
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import TemperatureChart from '../../components/TemperatureChart';
import { useAppStore } from '../../../shared/store';

interface ChartTypeConfig {
  id: 'temperature' | 'progress' | 'speed' | 'health';
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
}

interface MetricData {
  id: string;
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'normal' | 'warning' | 'critical' | 'good';
}

const chartTypes: ChartTypeConfig[] = [
  {
    id: 'temperature',
    name: 'Temperature',
    icon: <Thermometer className="w-4 h-4" />,
    color: '#ef4444',
    gradient: 'from-red-500/20 to-orange-500/10',
    description: 'Monitor hotend and bed temperatures'
  },
  {
    id: 'progress',
    name: 'Progress',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#22c55e',
    gradient: 'from-green-500/20 to-emerald-500/10',
    description: 'Track print progress and layer completion'
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: <Zap className="w-4 h-4" />,
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    description: 'Monitor print speed and movement'
  },
  {
    id: 'health',
    name: 'System Health',
    icon: <Activity className="w-4 h-4" />,
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    description: 'Overall printer health metrics'
  }
];

const timeRanges = [
  { id: '1h', label: '1 Hour', description: 'Last hour' },
  { id: '4h', label: '4 Hours', description: 'Last 4 hours' },
  { id: '12h', label: '12 Hours', description: 'Last 12 hours' },
  { id: '24h', label: '24 Hours', description: 'Last day' }
] as const;

const ChartSection = () => {
  const [chartType, setChartType] = useState<'temperature' | 'progress' | 'speed' | 'health'>('temperature');
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '12h' | '24h'>('1h');
  const [isLoading, setIsLoading] = useState(false);
  
  const { status, hotend, connected } = useAppStore((state) => ({
    status: state.status,
    hotend: state.hotend,
    connected: state.connected,
  }));

  const handleChartTypeChange = (newType: typeof chartType) => {
    if (newType === chartType) return;
    
    setIsLoading(true);
    setChartType(newType);
    
    // Simulate loading time for chart data
    setTimeout(() => setIsLoading(false), 300);
  };

  const currentChartConfig = chartTypes.find(c => c.id === chartType);

  // Dynamic metrics based on current state
  const metrics: MetricData[] = [
    {
      id: 'avg_temp',
      label: 'Avg Hotend Temp',
      value: hotend.toString(),
      unit: '°C',
      icon: <Thermometer className="w-4 h-4" />,
      color: hotend > 200 ? '#ef4444' : hotend > 150 ? '#f59e0b' : '#22c55e',
      trend: hotend > 200 ? 'up' : 'stable',
      trendValue: '+2.5°',
      status: hotend > 250 ? 'critical' : hotend > 200 ? 'warning' : 'normal'
    },
    {
      id: 'layer_height',
      label: 'Layer Height',
      value: '0.2',
      unit: 'mm',
      icon: <Layers className="w-4 h-4" />,
      color: '#3b82f6',
      status: 'normal'
    },
    {
      id: 'print_speed',
      label: 'Print Speed',
      value: status === 'printing' ? '50' : '0',
      unit: 'mm/s',
      icon: <Zap className="w-4 h-4" />,
      color: '#f59e0b',
      trend: status === 'printing' ? 'stable' : undefined,
      status: status === 'printing' ? 'good' : 'normal'
    },
    {
      id: 'filament_used',
      label: 'Filament Used',
      value: '24.5',
      unit: 'g',
      icon: <DollarSign className="w-4 h-4" />,
      color: '#10b981',
      trend: status === 'printing' ? 'up' : undefined,
      trendValue: '+0.2g/min',
      status: 'normal'
    },
    {
      id: 'print_time',
      label: 'Print Time',
      value: status === 'printing' ? '02:34' : '00:00',
      unit: 'hrs',
      icon: <Clock className="w-4 h-4" />,
      color: '#8b5cf6',
      status: 'normal'
    },
    {
      id: 'success_rate',
      label: 'Success Rate',
      value: '96.2',
      unit: '%',
      icon: <Target className="w-4 h-4" />,
      color: '#22c55e',
      trend: 'stable',
      status: 'good'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
                <p className="text-sm text-slate-400">
                  {currentChartConfig?.description || 'Real-time performance monitoring'}
                </p>
              </div>
            </div>
            
            {/* Connection Status Indicator */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              connected 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-red-400'
              }`} />
              <span className="text-sm font-semibold">
                {connected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Controls */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
        <div className="relative p-6">
          <div className="space-y-6">
            {/* Chart Type Selector */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">Chart Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {chartTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
                      chartType === type.id
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleChartTypeChange(type.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className={`p-3 rounded-xl ${
                          chartType === type.id ? 'bg-white/20' : 'bg-white/10'
                        }`}
                        style={{ color: type.color }}
                      >
                        {React.cloneElement(type.icon as React.ReactElement, { className: "w-6 h-6" })}
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{type.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{type.description}</div>
                      </div>
                    </div>
                    {chartType === type.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                        style={{ backgroundColor: type.color }}
                        layoutId="chartTypeIndicator"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Time Range Selector */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">Time Range</label>
              <div className="flex flex-wrap gap-2">
                {timeRanges.map((range) => (
                  <motion.button
                    key={range.id}
                    className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                      timeRange === range.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 shadow-lg'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white'
                    }`}
                    onClick={() => setTimeRange(range.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold">{range.label}</span>
                      <span className="text-xs opacity-75">{range.description}</span>
                    </div>
                    {timeRange === range.id && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                        layoutId="timeRangeIndicator"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Chart Display */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5" />
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${chartType}-${timeRange}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <motion.div
                    className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-white font-medium">Loading {currentChartConfig?.name} data...</p>
                  <p className="text-sm text-slate-400">Fetching real-time analytics</p>
                </div>
              ) : (
                <>
                  {chartType === 'temperature' ? (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                          <Thermometer className="w-5 h-5 text-red-400" />
                          <span>Temperature Monitoring</span>
                        </h3>
                        <div className="text-sm text-slate-400">
                          Last updated: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      <TemperatureChart />
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
                      <motion.div
                        className="max-w-md mx-auto"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div 
                          className="w-20 h-20 mx-auto mb-6 p-4 rounded-2xl bg-white/10 border border-white/20"
                          style={{ color: currentChartConfig?.color }}
                        >
                          {React.cloneElement(currentChartConfig?.icon as React.ReactElement, { className: "w-12 h-12 mx-auto" })}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{currentChartConfig?.name} Analytics</h3>
                        <p className="text-slate-400 mb-6">{currentChartConfig?.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {['Real-time data', 'Historical trends', 'Performance insights'].map((feature, index) => (
                            <motion.div
                              key={feature}
                              className="p-4 bg-white/5 rounded-xl border border-white/10"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                            >
                              <div className="text-sm font-medium text-white">{feature}</div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <motion.div
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-blue-300"
                          animate={{ 
                            boxShadow: [
                              "0 0 20px rgba(59, 130, 246, 0.3)",
                              "0 0 30px rgba(59, 130, 246, 0.5)",
                              "0 0 20px rgba(59, 130, 246, 0.3)"
                            ]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                        >
                          <Activity className="w-4 h-4" />
                          <span className="text-sm font-medium">Chart Coming Soon</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
            whileHover={{ 
              scale: 1.02, 
              y: -4,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background gradient based on status */}
            <div className={`absolute inset-0 ${
              metric.status === 'good' ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5' :
              metric.status === 'warning' ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5' :
              metric.status === 'critical' ? 'bg-gradient-to-r from-red-500/5 to-pink-500/5' :
              'bg-gradient-to-r from-blue-500/5 to-cyan-500/5'
            }`} />
            
            <div className="relative">
              {/* Header with icon and trend */}
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-2xl bg-white/10 border border-white/20"
                  style={{ color: metric.color }}
                >
                  {React.cloneElement(metric.icon as React.ReactElement, { className: "w-6 h-6" })}
                </div>
                
                {metric.trend && (
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                    metric.trend === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    metric.trend === 'down' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.trendValue && <span>{metric.trendValue}</span>}
                  </div>
                )}
              </div>
              
              {/* Main value */}
              <div className="mb-3">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-white" style={{ color: metric.color }}>
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-lg font-medium text-slate-400">{metric.unit}</span>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <div className="text-sm font-medium text-slate-300 mb-4">{metric.label}</div>
              
              {/* Status bar */}
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${
                    metric.status === 'good' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    metric.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    metric.status === 'critical' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                    'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: metric.status === 'good' ? '90%' :
                           metric.status === 'warning' ? '65%' :
                           metric.status === 'critical' ? '35%' : '75%'
                  }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-medium ${
                  metric.status === 'good' ? 'text-green-400' :
                  metric.status === 'warning' ? 'text-yellow-400' :
                  metric.status === 'critical' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {metric.status === 'good' ? 'Excellent' :
                   metric.status === 'warning' ? 'Warning' :
                   metric.status === 'critical' ? 'Critical' : 'Normal'}
                </span>
                
                <div className={`w-2 h-2 rounded-full ${
                  metric.status === 'good' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' :
                  metric.status === 'critical' ? 'bg-red-400 animate-pulse' :
                  'bg-blue-400'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ChartSection;
