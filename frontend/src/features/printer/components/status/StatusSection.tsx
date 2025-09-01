import { motion } from 'framer-motion';
import { useAppStore } from '../../../shared/store';
import { 
  Activity, Wifi, WifiOff, Thermometer, Flame, Clock, TrendingUp,
  CheckCircle, AlertCircle, Pause, Play
} from 'lucide-react';

const StatusSection = () => {
  const { status, hotend, bed, connected } = useAppStore((state) => ({
    status: state.status,
    hotend: state.hotend,
    bed: state.bed,
    connected: state.connected,
  }));

  const statusConfig = {
    idle: { 
      color: 'rgb(59, 130, 246)', 
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: CheckCircle,
      label: 'Ready'
    },
    printing: { 
      color: 'rgb(16, 185, 129)', 
      bgColor: 'rgba(16, 185, 129, 0.1)',
      icon: Play,
      label: 'Printing'
    },
    paused: { 
      color: 'rgb(245, 158, 11)', 
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: Pause,
      label: 'Paused'
    },
    error: { 
      color: 'rgb(239, 68, 68)', 
      bgColor: 'rgba(239, 68, 68, 0.1)',
      icon: AlertCircle,
      label: 'Error'
    },
  }[status];

  const StatusIcon = statusConfig.icon;
  const progress = status === 'printing' ? 35 : 0;
  const timeRemaining = status === 'printing' ? '01:25:43' : '--:--';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Connection Status */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            System Status
          </h3>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div 
          className="glass-card p-4 border-l-4"
          style={{ 
            borderLeftColor: statusConfig.color,
            backgroundColor: statusConfig.bgColor
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              <StatusIcon 
                className="w-6 h-6" 
                style={{ color: statusConfig.color }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-white">{statusConfig.label}</h4>
              <p className="text-sm text-gray-300">
                {status === 'printing' ? 'Print in progress' : 
                 status === 'paused' ? 'Print paused' :
                 status === 'error' ? 'Attention required' :
                 'Ready to print'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Temperature Monitoring */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-400" />
          Temperature Monitor
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Hotend Temperature */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-gray-300">Hotend</span>
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{hotend}°C</div>
            <div className="text-xs text-gray-400 mt-1">
              Target: {status === 'printing' ? '210°C' : '200°C'}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(hotend / 250) * 100}%` }}
              />
            </div>
          </div>

          {/* Bed Temperature */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded" />
                <span className="text-sm font-medium text-gray-300">Bed</span>
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{bed}°C</div>
            <div className="text-xs text-gray-400 mt-1">
              Target: {status === 'printing' ? '65°C' : '60°C'}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(bed / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Print Progress (only show when printing) */}
      {status === 'printing' && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Print Progress
            </h3>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{timeRemaining} remaining</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Completion</span>
              <span className="text-lg font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Layer 142/405</span>
              <span>85.2 MB processed</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusSection;
