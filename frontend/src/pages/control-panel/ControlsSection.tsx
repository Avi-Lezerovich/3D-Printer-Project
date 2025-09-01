import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Settings, Home, Wrench, Play, Pause, Square, Thermometer,
  Flame, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Zap, Target, AlertTriangle, Activity
} from 'lucide-react';
import Modal from '../../shared/components/ui/feedback/Modal';

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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Status Overview Card */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Printer Status</h3>
                <p className="text-sm text-slate-400">Real-time system overview</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              connected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {connected ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Hotend Temp</p>
                  <p className="text-2xl font-bold text-white">{hotend}°C</p>
                  <p className="text-xs text-slate-500">Target: {hotendTarget}°C</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Thermometer className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Bed Temp</p>
                  <p className="text-2xl font-bold text-white">{bed}°C</p>
                  <p className="text-xs text-slate-500">Target: {bedTarget}°C</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl border ${
                  status === 'printing' ? 'bg-green-500/10 border-green-500/20' :
                  status === 'paused' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  status === 'error' ? 'bg-red-500/10 border-red-500/20' :
                  'bg-slate-500/10 border-slate-500/20'
                }`}>
                  {status === 'printing' ? <Play className="w-5 h-5 text-green-400" /> :
                   status === 'paused' ? <Pause className="w-5 h-5 text-yellow-400" /> :
                   status === 'error' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                   <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Status</p>
                  <p className="text-lg font-bold text-white capitalize">{status}</p>
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'printing' ? 'bg-green-400 animate-pulse' :
                    status === 'paused' ? 'bg-yellow-400' :
                    status === 'error' ? 'bg-red-400' :
                    'bg-slate-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Print Control Actions */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5" />
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Print Controls</h3>
              <p className="text-sm text-slate-400">Manage your print operations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={handlePrint}
              disabled={!connected}
              className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
                !connected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              } ${status === 'paused' ? 
                'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50' :
                'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50'
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-4 rounded-2xl ${status === 'paused' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                  <Play className={`w-8 h-8 ${status === 'paused' ? 'text-blue-400' : 'text-green-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {status === 'paused' ? 'Resume' : 'Start Print'}
                  </p>
                  <p className="text-xs text-slate-400">Begin printing process</p>
                </div>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handlePause}
              disabled={!connected || status === 'idle'}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 rounded-2xl bg-yellow-500/20">
                  <Pause className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">Pause</p>
                  <p className="text-xs text-slate-400">Temporarily halt printing</p>
                </div>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleStop}
              disabled={!connected || status === 'idle'}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 rounded-2xl bg-red-500/20">
                  <Square className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">Stop</p>
                  <p className="text-xs text-slate-400">Cancel current print</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Temperature Controls */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <Thermometer className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Temperature Control</h3>
              <p className="text-sm text-slate-400">Precise heating management</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Hotend Control */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <Flame className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Hotend</h4>
                    <p className="text-sm text-slate-400">Extruder temperature</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{hotend}°C</p>
                  <p className="text-xs text-slate-500">of {hotendTarget}°C</p>
                </div>
              </div>
              
              {/* Visual Temperature Progress */}
              <div className="relative mb-6">
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((hotend / Math.max(hotendTarget, 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0°C</span>
                  <span>{hotendTarget}°C</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={hotendTarget}
                    onChange={(e) => handleHotendChange(Number(e.target.value))}
                    disabled={!connected}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-hotend"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #ef4444 ${(hotendTarget/300)*100}%, #475569 ${(hotendTarget/300)*100}%, #475569 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>150</span>
                    <span>300</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={hotendTarget}
                    onChange={(e) => handleHotendChange(Number(e.target.value))}
                    disabled={!connected}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white text-sm font-medium focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/25"
                    min="0"
                    max="300"
                  />
                  <div className="flex gap-2">
                    <motion.button 
                      onClick={() => handleHotendChange(200)}
                      disabled={!connected}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:border-blue-400/50 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      PLA
                    </motion.button>
                    <motion.button 
                      onClick={() => handleHotendChange(230)}
                      disabled={!connected}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-medium hover:border-purple-400/50 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ABS
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Bed Control */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Thermometer className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Heated Bed</h4>
                    <p className="text-sm text-slate-400">Print bed temperature</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{bed}°C</p>
                  <p className="text-xs text-slate-500">of {bedTarget}°C</p>
                </div>
              </div>

              {/* Visual Temperature Progress */}
              <div className="relative mb-6">
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((bed / Math.max(bedTarget, 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0°C</span>
                  <span>{bedTarget}°C</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={bedTarget}
                    onChange={(e) => handleBedChange(Number(e.target.value))}
                    disabled={!connected}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-bed"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${(bedTarget/120)*100}%, #475569 ${(bedTarget/120)*100}%, #475569 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>60</span>
                    <span>120</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={bedTarget}
                    onChange={(e) => handleBedChange(Number(e.target.value))}
                    disabled={!connected}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white text-sm font-medium focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
                    min="0"
                    max="120"
                  />
                  <div className="flex gap-2">
                    <motion.button 
                      onClick={() => handleBedChange(60)}
                      disabled={!connected}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:border-blue-400/50 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      PLA
                    </motion.button>
                    <motion.button 
                      onClick={() => handleBedChange(80)}
                      disabled={!connected}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-medium hover:border-purple-400/50 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ABS
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Movement Controls */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Movement Control</h3>
              <p className="text-sm text-slate-400">Precise axis positioning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced XY Movement */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-6 text-center">XY Movement</h4>
              <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
                <div></div>
                <motion.button 
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUp className="w-6 h-6 text-blue-400 mx-auto" />
                </motion.button>
                <div></div>
                
                <motion.button 
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-6 h-6 text-blue-400 mx-auto" />
                </motion.button>
                <motion.button 
                  className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Home className="w-6 h-6 text-green-400 mx-auto" />
                </motion.button>
                <motion.button 
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight className="w-6 h-6 text-blue-400 mx-auto" />
                </motion.button>
                
                <div></div>
                <motion.button 
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, y: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowDown className="w-6 h-6 text-blue-400 mx-auto" />
                </motion.button>
                <div></div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Tap arrows to move in 1mm steps</p>
            </div>

            {/* Enhanced Z Movement */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-6 text-center">Z-Axis Control</h4>
              <div className="flex flex-col items-center space-y-4">
                <motion.button 
                  className="p-4 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUp className="w-6 h-6 text-cyan-400" />
                </motion.button>
                
                <div className="bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-600/50">
                  <p className="text-sm font-medium text-slate-300">Height: 0.2mm</p>
                </div>
                
                <motion.button 
                  className="p-4 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!connected}
                  whileHover={{ scale: 1.05, y: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowDown className="w-6 h-6 text-cyan-400" />
                </motion.button>
                
                <motion.button 
                  className="px-6 py-3 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-2xl text-sm font-medium text-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={!connected}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-4 h-4" />
                  <span>Home Z</span>
                </motion.button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Precise 0.1mm Z positioning</p>
            </div>
          </div>

          {/* Control Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <motion.button 
              className="px-6 py-3 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-2xl text-green-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={!connected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              <span>Home All Axes</span>
            </motion.button>
            <motion.button 
              className="px-6 py-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl text-purple-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={!connected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Auto Level Bed</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Utilities */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5" />
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <Wrench className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Utility Functions</h3>
              <p className="text-sm text-slate-400">Advanced printer operations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button 
              className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3"
              disabled={!connected}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Motors Off</p>
                <p className="text-xs text-slate-400">Disable steppers</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3"
              disabled={!connected}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <RotateCcw className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Reset</p>
                <p className="text-xs text-slate-400">Emergency reset</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 hover:border-slate-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3"
              disabled={!connected}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-slate-500/20 rounded-xl">
                <Settings className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Settings</p>
                <p className="text-xs text-slate-400">Configuration</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3"
              disabled={!connected}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Calibrate</p>
                <p className="text-xs text-slate-400">Precision tuning</p>
              </div>
            </motion.button>
          </div>
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
