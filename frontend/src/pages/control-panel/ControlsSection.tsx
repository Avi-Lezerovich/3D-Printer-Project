import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Settings, Home, Wrench, Play, Pause, Square, Thermometer,
  Flame, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Zap, Target
} from 'lucide-react';
import Modal from '../../components/Modal';

const ControlsSection = () => {
  const {
    hotend,
    bed,
    setTemps,
    setStatus,
    connected,
    status,
  } = useAppStore((state) => ({
    hotend: state.hotend,
    bed: state.bed,
    setTemps: state.setTemps,
    setStatus: state.setStatus,
    connected: state.connected,
    status: state.status,
  }));

  const [showStop, setShowStop] = React.useState(false);
  const [hotendTarget, setHotendTarget] = React.useState(200);
  const [bedTarget, setBedTarget] = React.useState(60);

  const handleHotendChange = (value: number) => {
    setHotendTarget(value);
    setTemps(value, bed);
  };

  const handleBedChange = (value: number) => {
    setBedTarget(value);
    setTemps(hotend, value);
  };

  const handlePrint = () => {
    if (status === 'paused') {
      setStatus('printing');
    } else {
      setStatus('printing');
    }
  };

  const handleStop = () => {
    setShowStop(true);
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const confirmStop = () => {
    setStatus('idle');
    setShowStop(false);
  };

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
      {/* Print Control Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-400" />
          Print Controls
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handlePrint}
            disabled={!connected}
            className="glass-button p-4 flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium">
              {status === 'paused' ? 'Resume' : 'Start'}
            </span>
          </button>
          
          <button
            onClick={handlePause}
            disabled={!connected || status === 'idle'}
            className="glass-button p-4 flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <Pause className="w-6 h-6 text-yellow-400" />
            <span className="text-sm font-medium">Pause</span>
          </button>
          
          <button
            onClick={handleStop}
            disabled={!connected || status === 'idle'}
            className="glass-button p-4 flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <Square className="w-6 h-6 text-red-400" />
            <span className="text-sm font-medium">Stop</span>
          </button>
        </div>
      </motion.div>

      {/* Temperature Controls */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-400" />
          Temperature Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotend Control */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="font-medium text-white">Hotend</h4>
                <p className="text-xs text-gray-400">Current: {hotend}°C</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="300"
                value={hotendTarget}
                onChange={(e) => handleHotendChange(Number(e.target.value))}
                disabled={!connected}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  value={hotendTarget}
                  onChange={(e) => handleHotendChange(Number(e.target.value))}
                  disabled={!connected}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  min="0"
                  max="300"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleHotendChange(200)}
                    disabled={!connected}
                    className="glass-button px-3 py-1 text-xs disabled:opacity-50"
                  >
                    PLA
                  </button>
                  <button 
                    onClick={() => handleHotendChange(230)}
                    disabled={!connected}
                    className="glass-button px-3 py-1 text-xs disabled:opacity-50"
                  >
                    ABS
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bed Control */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-blue-400 rounded" />
              <div>
                <h4 className="font-medium text-white">Bed</h4>
                <p className="text-xs text-gray-400">Current: {bed}°C</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="120"
                value={bedTarget}
                onChange={(e) => handleBedChange(Number(e.target.value))}
                disabled={!connected}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  value={bedTarget}
                  onChange={(e) => handleBedChange(Number(e.target.value))}
                  disabled={!connected}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  min="0"
                  max="120"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBedChange(60)}
                    disabled={!connected}
                    className="glass-button px-3 py-1 text-xs disabled:opacity-50"
                  >
                    PLA
                  </button>
                  <button 
                    onClick={() => handleBedChange(80)}
                    disabled={!connected}
                    className="glass-button px-3 py-1 text-xs disabled:opacity-50"
                  >
                    ABS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Movement Controls */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Movement & Positioning
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* XY Movement */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-3">XY Axis</h4>
            <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
              <div></div>
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowUp className="w-4 h-4" />
              </button>
              <div></div>
              
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <Home className="w-4 h-4" />
              </button>
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div></div>
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowDown className="w-4 h-4" />
              </button>
              <div></div>
            </div>
          </div>

          {/* Z Movement */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-3">Z Axis</h4>
            <div className="flex flex-col items-center gap-2">
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowUp className="w-4 h-4" />
              </button>
              <div className="text-xs text-gray-400">Z: 0.2mm</div>
              <button className="glass-button p-2 disabled:opacity-50" disabled={!connected}>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button className="glass-button p-2 text-xs px-3 disabled:opacity-50" disabled={!connected}>
                <Home className="w-3 h-3 mr-1" />
                Home Z
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button className="glass-button px-4 py-2 disabled:opacity-50" disabled={!connected}>
            <Home className="w-4 h-4 mr-2" />
            Home All
          </button>
          <button className="glass-button px-4 py-2 disabled:opacity-50" disabled={!connected}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Auto Level
          </button>
        </div>
      </motion.div>

      {/* Utilities */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          Utilities
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="glass-button p-3 flex flex-col items-center gap-2 disabled:opacity-50" disabled={!connected}>
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xs">Motors Off</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2 disabled:opacity-50" disabled={!connected}>
            <RotateCcw className="w-5 h-5 text-blue-400" />
            <span className="text-xs">Reset</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2 disabled:opacity-50" disabled={!connected}>
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-xs">Settings</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2 disabled:opacity-50" disabled={!connected}>
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-xs">Calibrate</span>
          </button>
        </div>
      </motion.div>

      {/* Stop Confirmation Modal */}
      {showStop && (
        <Modal
          open={showStop}
          onClose={() => setShowStop(false)}
          title="Stop Print?"
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-300">
              Are you sure you want to stop the current print? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setShowStop(false)}
                className="glass-button px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={confirmStop}
                className="glass-button px-4 py-2 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              >
                Stop Print
              </button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default ControlsSection;
