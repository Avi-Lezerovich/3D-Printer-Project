import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, CameraOff, Maximize2, Minimize2, Play, Pause,
  Volume2, VolumeX, Settings, RotateCcw, ZoomIn, ZoomOut,
  Grid3X3, ScanLine, Aperture, Download, Circle, Square,
  Monitor, Wifi, Activity, Eye, Focus
} from 'lucide-react';

// Vendor fullscreen API typings
interface FullscreenDocument extends Document {
  readonly webkitFullscreenElement?: Element | null;
  readonly msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

const WebcamSection = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [streamQuality, setStreamQuality] = useState('HD');
  const [zoom, setZoom] = useState(100);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState(85);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      const isCurrentlyFullscreen = Boolean(
        doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      if (isFullscreen) {
        setShowControls(true);
        timeout = setTimeout(() => setShowControls(false), 3000);
      } else {
        setShowControls(true);
      }
    };

    if (isFullscreen) {
      const handleMouseMove = () => resetTimeout();
      document.addEventListener('mousemove', handleMouseMove);
      resetTimeout();
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        const element = containerRef.current as FullscreenElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } else {
        const doc = document as FullscreenDocument;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Camera Feed */}
      <motion.div 
        ref={containerRef}
        variants={itemVariants} 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5" />
        <div className="relative p-6">
          {/* Header with Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                <Camera className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Camera Feed</h3>
                <p className="text-sm text-slate-400">Real-time printer monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Quality */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">{connectionQuality}%</span>
              </div>
              
              {/* Live Indicator */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                isStreaming 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  isStreaming ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-red-400'
                }`} />
                <span className="text-sm font-bold">
                  {isStreaming ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              
              {/* Recording Indicator */}
              {isRecording && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-full"
                >
                  <Circle className="w-4 h-4 text-red-400 animate-pulse fill-current" />
                  <span className="text-sm font-medium text-red-400">REC</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced Video Container */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
            {isStreaming ? (
              <div 
                className="w-full h-full relative bg-gradient-to-br from-slate-800 to-slate-900"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {/* Simulated camera feed */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Camera className="w-12 h-12 text-blue-400 mx-auto" />
                    </motion.div>
                    <p className="text-xl font-bold text-white mb-2">Camera Feed Active</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-slate-300">
                      <span className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4" />
                        <span>{streamQuality}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Grid Overlay */}
                <AnimatePresence>
                  {showGrid && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <motion.div 
                            key={i} 
                            className="border border-white/30"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Enhanced Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div 
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-12 h-12 border-2 border-white/40 rounded-full">
                      <div className="absolute top-1/2 left-1/2 w-6 h-px bg-white/40 transform -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute top-1/2 left-1/2 h-6 w-px bg-white/40 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </motion.div>
                </div>

                {/* Live Data Overlay */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-xs text-white/80 space-y-1">
                      <div className="flex justify-between space-x-4">
                        <span>Zoom:</span>
                        <span className="text-blue-400">{zoom}%</span>
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span>Quality:</span>
                        <span className="text-purple-400">{streamQuality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2
                    }}
                  >
                    <CameraOff className="w-20 h-20 mx-auto mb-6 text-slate-500" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mb-2">Camera Offline</p>
                  <p className="text-sm text-slate-400">Check connection and try reconnecting</p>
                  <motion.button
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-400/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsStreaming(true)}
                  >
                    Reconnect Camera
                  </motion.button>
                </div>
              </div>
            )}

            {/* Enhanced Camera Controls Overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"
                >
                  {/* Top Controls Bar */}
                  <div className="absolute top-4 right-4">
                    {/* Settings Toggle */}
                    <motion.button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-2 rounded-xl transition-all ${
                        showSettings 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-black/40 text-white/60 border border-white/20 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Settings className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-center items-center space-x-3">
                      {/* Primary Controls */}
                      <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                        <motion.button
                          onClick={() => setIsStreaming(!isStreaming)}
                          className={`p-3 rounded-xl transition-all ${
                            isStreaming 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isStreaming ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </motion.button>
                        
                        <motion.button
                          onClick={() => setIsRecording(!isRecording)}
                          className={`p-3 rounded-xl transition-all ${
                            isRecording
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:border-red-500/30 hover:text-red-400'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-current" />}
                        </motion.button>
                        
                        <motion.button
                          className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-400/50 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Download className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Audio & Visual Controls */}
                      <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                        <motion.button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-3 rounded-xl transition-all ${
                            isMuted
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </motion.button>
                        
                        <motion.button
                          onClick={() => setShowGrid(!showGrid)}
                          className={`p-3 rounded-xl transition-all ${
                            showGrid 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:border-blue-500/30 hover:text-blue-400'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Grid3X3 className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button
                          className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Focus className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                        <motion.button
                          onClick={() => setZoom(Math.max(50, zoom - 25))}
                          disabled={zoom <= 50}
                          className="p-3 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:border-slate-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: zoom > 50 ? 1.1 : 1 }}
                          whileTap={{ scale: zoom > 50 ? 0.9 : 1 }}
                        >
                          <ZoomOut className="w-5 h-5" />
                        </motion.button>
                        
                        <div className="px-3 py-2 bg-white/10 rounded-xl">
                          <span className="text-xs font-medium text-white">{zoom}%</span>
                        </div>
                        
                        <motion.button
                          onClick={() => setZoom(Math.min(200, zoom + 25))}
                          disabled={zoom >= 200}
                          className="p-3 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:border-slate-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: zoom < 200 ? 1.1 : 1 }}
                          whileTap={{ scale: zoom < 200 ? 0.9 : 1 }}
                        >
                          <ZoomIn className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Fullscreen Toggle */}
                      <motion.button
                        onClick={toggleFullscreen}
                        className="p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Camera Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            variants={itemVariants} 
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Camera Settings</h3>
                    <p className="text-sm text-slate-400">Advanced configuration options</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:border-slate-400/50 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video Settings */}
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <span>Video Quality</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Resolution</label>
                        <select 
                          value={streamQuality}
                          onChange={(e) => setStreamQuality(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
                        >
                          <option value="HD">HD (720p) - Good Quality</option>
                          <option value="FHD">Full HD (1080p) - High Quality</option>
                          <option value="4K">4K (2160p) - Ultra Quality</option>
                        </select>
                      </div>
                      
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span>Performance</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                          <span>Connection Quality</span>
                          <span className="text-green-400">{connectionQuality}%</span>
                        </label>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${connectionQuality}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-600/50">
                          <p className="text-slate-400">Latency</p>
                          <p className="text-white font-bold">12ms</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-600/50">
                          <p className="text-slate-400">Bandwidth</p>
                          <p className="text-white font-bold">2.4 Mbps</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera Actions */}
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-cyan-400" />
                      <span>Quick Actions</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button 
                        className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all flex flex-col items-center space-y-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Camera className="w-6 h-6 text-blue-400" />
                        <span className="text-sm font-medium text-white">Snapshot</span>
                      </motion.button>

                      <motion.button 
                        className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-xl transition-all flex flex-col items-center space-y-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw className="w-6 h-6 text-green-400" />
                        <span className="text-sm font-medium text-white">Rotate</span>
                      </motion.button>

                      <motion.button 
                        className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 hover:border-purple-400/50 rounded-xl transition-all flex flex-col items-center space-y-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Focus className="w-6 h-6 text-purple-400" />
                        <span className="text-sm font-medium text-white">Focus</span>
                      </motion.button>

                      <motion.button 
                        className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 hover:border-orange-400/50 rounded-xl transition-all flex flex-col items-center space-y-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ScanLine className="w-6 h-6 text-orange-400" />
                        <span className="text-sm font-medium text-white">Calibrate</span>
                      </motion.button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WebcamSection;
