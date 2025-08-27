import { useState } from 'react';
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
import { useAppStore } from '../../shared/store';

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
    <motion.section 
      className="modern-chart-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header */}
      <motion.div className="chart-header-modern" variants={itemVariants}>
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="section-title">Real-time Monitoring</h2>
              <p className="section-subtitle">
                {currentChartConfig?.description || 'Monitor your printer\'s performance'}
              </p>
            </div>
          </div>
          
          {/* Connection Status Indicator */}
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <div className="status-indicator" />
            <span className="status-text">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Controls */}
      <motion.div className="chart-controls-modern" variants={itemVariants}>
        {/* Chart Type Selector */}
        <div className="control-group">
          <label className="control-label">Chart Type</label>
          <div className="chart-type-grid">
            {chartTypes.map((type) => (
              <motion.button
                key={type.id}
                className={`chart-type-card ${chartType === type.id ? 'active' : ''}`}
                onClick={() => handleChartTypeChange(type.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  '--accent-color': type.color,
                  '--gradient': type.gradient
                } as React.CSSProperties}
              >
                <div className="card-icon" style={{ color: type.color }}>
                  {type.icon}
                </div>
                <div className="card-content">
                  <div className="card-title">{type.name}</div>
                </div>
                {chartType === type.id && (
                  <motion.div
                    className="active-indicator"
                    layoutId="chartTypeIndicator"
                    style={{ backgroundColor: type.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="control-group">
          <label className="control-label">Time Range</label>
          <div className="time-range-tabs">
            {timeRanges.map((range) => (
              <motion.button
                key={range.id}
                className={`time-range-tab ${timeRange === range.id ? 'active' : ''}`}
                onClick={() => setTimeRange(range.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {range.label}
                {timeRange === range.id && (
                  <motion.div
                    className="tab-indicator"
                    layoutId="timeRangeIndicator"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Chart Display */}
      <motion.div className="chart-display-modern" variants={itemVariants}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${chartType}-${timeRange}`}
            className="chart-container-modern"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="chart-loading">
                <div className="loading-spinner" />
                <p>Loading {currentChartConfig?.name} data...</p>
              </div>
            ) : (
              <>
                {chartType === 'temperature' && <TemperatureChart />}
                {chartType !== 'temperature' && (
                  <div className="chart-placeholder-modern">
                    <div className="placeholder-content">
                      <div 
                        className="placeholder-icon"
                        style={{ color: currentChartConfig?.color }}
                      >
                        {currentChartConfig?.icon}
                      </div>
                      <h3>{currentChartConfig?.name} Chart</h3>
                      <p>{currentChartConfig?.description}</p>
                      <div className="placeholder-features">
                        <span>Real-time data</span>
                        <span>Historical trends</span>
                        <span>Performance insights</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Metrics Grid */}
      <motion.div className="metrics-grid-modern" variants={itemVariants}>
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            className={`metric-card-modern status-${metric.status}`}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="metric-header">
              <div 
                className="metric-icon-modern"
                style={{ color: metric.color }}
              >
                {metric.icon}
              </div>
              <div className="metric-trend">
                {metric.trend && (
                  <div className={`trend-indicator ${metric.trend}`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.trendValue && (
                      <span className="trend-value">{metric.trendValue}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="metric-content">
              <div className="metric-value-modern">
                <span className="value">{metric.value}</span>
                {metric.unit && <span className="unit">{metric.unit}</span>}
              </div>
              <div className="metric-label-modern">{metric.label}</div>
            </div>

            <div className={`metric-status-bar status-${metric.status}`} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default ChartSection;
