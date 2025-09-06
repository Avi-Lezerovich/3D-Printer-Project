import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Activity, Thermometer, Flame, AlertTriangle } from 'lucide-react';

interface StatusBarProps {
  connected: boolean;
  status: string;
  hotend: number;
  bed: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ connected, status, hotend, bed }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'printing': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTemperatureStatus = (temp: number, type: 'hotend' | 'bed') => {
    const dangerTemp = type === 'hotend' ? 250 : 100;
    const warningTemp = type === 'hotend' ? 200 : 80;
    
    if (temp >= dangerTemp) return 'text-red-400';
    if (temp >= warningTemp) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <motion.div 
      className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-6">
        {/* Connection Status */}
        <motion.div 
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
            connected 
              ? 'text-green-400 bg-green-500/10 border-green-500/30' 
              : 'text-red-400 bg-red-500/10 border-red-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          {connected && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
        </motion.div>

        {/* Print Status */}
        <motion.div 
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${getStatusColor()}`}
          whileHover={{ scale: 1.05 }}
        >
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{status}</span>
        </motion.div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Hotend Temperature */}
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <Flame className={`w-4 h-4 ${getTemperatureStatus(hotend, 'hotend')}`} />
          <span className={`text-sm font-mono ${getTemperatureStatus(hotend, 'hotend')}`}>
            {hotend}°C
          </span>
          {hotend > 200 && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
        </motion.div>

        {/* Bed Temperature */}
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <Thermometer className={`w-4 h-4 ${getTemperatureStatus(bed, 'bed')}`} />
          <span className={`text-sm font-mono ${getTemperatureStatus(bed, 'bed')}`}>
            {bed}°C
          </span>
          {bed > 80 && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
        </motion.div>
      </div>
    </motion.div>
  );
};
