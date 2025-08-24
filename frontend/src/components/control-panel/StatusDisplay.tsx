import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, WifiOff, Activity, Clock, Thermometer, 
  Zap, AlertCircle, CheckCircle, Play, Pause, Flame
} from 'lucide-react';

interface StatusDisplayProps {
  status: string;
  statusColor: string;
  connected: boolean;
  hotend: number;
  bed: number;
  progress?: number;
  timeRemaining?: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  status, 
  statusColor, 
  connected,
  hotend,
  bed,
  progress = 0,
  timeRemaining = '--:--'
}) => {
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'printing': return <Play className="w-5 h-5" />;
      case 'paused': return <Pause className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getConnectionColor = () => {
    return connected ? 'text-green-400' : 'text-red-400';
  };

  const getConnectionBg = () => {
    return connected ? 'bg-green-500/10' : 'bg-red-500/10';
  };

  const getTemperatureColor = (temp: number, max: number) => {
    if (temp === 0) return 'text-blue-400';
    if (temp >= max * 0.8) return 'text-red-400';
    if (temp >= max * 0.5) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="status-display-enhanced">
      <div className="status-header">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Printer Status</h3>
            <p className="text-sm text-slate-400">Real-time monitoring dashboard</p>
          </div>
        </div>
      </div>

      <div className="status-grid">
        {/* Connection Status */}
        <motion.div 
          className={`status-card connection-status ${getConnectionBg()}`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="status-card-header">
            <div className={`status-icon ${getConnectionColor()}`}>
              {connected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div className="status-label">Connection</div>
          </div>
          <div className="status-value">
            <span className={getConnectionColor()}>
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`} />
        </motion.div>

        {/* Print Status */}
        <motion.div 
          className="status-card print-status"
          style={{ 
            background: `linear-gradient(135deg, ${statusColor}20 0%, ${statusColor}10 100%)`,
            borderColor: `${statusColor}30`
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="status-card-header">
            <div className="status-icon" style={{ color: statusColor }}>
              {getStatusIcon()}
            </div>
            <div className="status-label">Print Status</div>
          </div>
          <div className="status-value">
            <span style={{ color: statusColor }} className="capitalize">
              {status}
            </span>
          </div>
          {progress > 0 && (
            <div className="progress-indicator">
              <div className="progress-bar-mini">
                <div 
                  className="progress-fill-mini" 
                  style={{ 
                    width: `${progress}%`,
                    background: statusColor
                  }}
                />
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          )}
        </motion.div>

        {/* Temperature Status - Hotend */}
        <motion.div 
          className="status-card temp-status"
          whileHover={{ scale: 1.02 }}
        >
          <div className="status-card-header">
            <div className={`status-icon ${getTemperatureColor(hotend, 300)}`}>
              <Flame className="w-5 h-5" />
            </div>
            <div className="status-label">Hotend</div>
          </div>
          <div className="status-value">
            <span className={getTemperatureColor(hotend, 300)}>
              {hotend}°C
            </span>
          </div>
          <div className="temp-indicator-mini">
            <div 
              className="temp-fill" 
              style={{ 
                width: `${(hotend / 300) * 100}%`,
                background: hotend > 200 ? '#ef4444' : hotend > 100 ? '#f97316' : '#3b82f6'
              }}
            />
          </div>
        </motion.div>

        {/* Temperature Status - Bed */}
        <motion.div 
          className="status-card temp-status"
          whileHover={{ scale: 1.02 }}
        >
          <div className="status-card-header">
            <div className={`status-icon ${getTemperatureColor(bed, 120)}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="status-label">Heated Bed</div>
          </div>
          <div className="status-value">
            <span className={getTemperatureColor(bed, 120)}>
              {bed}°C
            </span>
          </div>
          <div className="temp-indicator-mini">
            <div 
              className="temp-fill" 
              style={{ 
                width: `${(bed / 120) * 100}%`,
                background: bed > 80 ? '#ef4444' : bed > 40 ? '#f97316' : '#3b82f6'
              }}
            />
          </div>
        </motion.div>

        {/* Time Remaining */}
        {status === 'printing' && (
          <motion.div 
            className="status-card time-status bg-purple-500/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="status-card-header">
              <div className="status-icon text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="status-label">Time Left</div>
            </div>
            <div className="status-value">
              <span className="text-purple-400">
                {timeRemaining}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
