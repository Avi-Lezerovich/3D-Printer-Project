import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, CameraOff, Maximize2, Minimize2, Play, Pause,
  Volume2, VolumeX, Settings, RotateCcw, ZoomIn, ZoomOut,
  Grid3X3, ScanLine, Aperture
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
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Camera Feed */}
      <motion.div 
        ref={containerRef}
        variants={itemVariants} 
        className="glass-card p-6 relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            Live Camera Feed
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className={`text-sm font-medium ${isStreaming ? 'text-green-400' : 'text-red-400'}`}>
              {isStreaming ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
          {isStreaming ? (
            <div 
              className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="text-white/60 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Camera Feed Active</p>
                <p className="text-sm opacity-75">Quality: {streamQuality}</p>
              </div>
              
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 border border-white/40">
                  <div className="absolute top-1/2 left-1/2 w-full h-px bg-white/40 transform -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 h-full w-px bg-white/40 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <CameraOff className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Camera Offline</p>
                <p className="text-sm">Check connection and try again</p>
              </div>
            </div>
          )}

          {/* Camera Controls Overlay */}
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            >
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm bg-black/40 px-2 py-1 rounded">
                    Zoom: {zoom}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setStreamQuality(streamQuality === 'HD' ? '4K' : streamQuality === '4K' ? 'FHD' : 'HD')}
                    className="glass-button p-2 text-xs"
                  >
                    {streamQuality}
                  </button>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setIsStreaming(!isStreaming)}
                    className="glass-button p-3"
                  >
                    {isStreaming ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="glass-button p-3"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`glass-button p-3 ${showGrid ? 'bg-blue-500/20' : ''}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                    className="glass-button p-3 disabled:opacity-50"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                    className="glass-button p-3 disabled:opacity-50"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="glass-button p-3"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Camera Settings */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Camera Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stream Quality */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Aperture className="w-4 h-4 text-blue-400" />
              Stream Quality
            </h4>
            <select 
              value={streamQuality}
              onChange={(e) => setStreamQuality(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="HD">HD (720p)</option>
              <option value="FHD">Full HD (1080p)</option>
              <option value="4K">4K (2160p)</option>
            </select>
          </div>

          {/* Frame Rate */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-green-400" />
              Frame Rate
            </h4>
            <select className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
              <option value="120">120 FPS</option>
            </select>
          </div>
        </div>
        
        {/* Camera Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="glass-button p-3 flex flex-col items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <span className="text-xs">Snapshot</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2">
            <RotateCcw className="w-5 h-5 text-green-400" />
            <span className="text-xs">Rotate</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-xs">Advanced</span>
          </button>
          <button className="glass-button p-3 flex flex-col items-center gap-2">
            <ScanLine className="w-5 h-5 text-orange-400" />
            <span className="text-xs">Calibrate</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WebcamSection;
