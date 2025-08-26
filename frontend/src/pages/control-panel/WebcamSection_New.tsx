import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, CameraOff, Maximize2, Minimize2, Play, Pause,
  Volume2, VolumeX, Settings
} from 'lucide-react';

// Vendor fullscreen API typings to avoid implicit any usage
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
  const [streamQuality] = useState('HD');
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

    const handleMouseMove = () => resetTimeout();

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
      resetTimeout();
    } else {
      setShowControls(true);
      document.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullscreen]);

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const el = containerRef.current as FullscreenElement;
        if (typeof el.requestFullscreen === 'function') {
          await el.requestFullscreen();
        } else if (typeof el.webkitRequestFullscreen === 'function') {
          await el.webkitRequestFullscreen();
        } else if (typeof el.msRequestFullscreen === 'function') {
          await el.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        const doc = document as FullscreenDocument;
        if (typeof doc.exitFullscreen === 'function') {
          await doc.exitFullscreen();
        } else if (typeof doc.webkitExitFullscreen === 'function') {
          await doc.webkitExitFullscreen();
        } else if (typeof doc.msExitFullscreen === 'function') {
          await doc.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback: toggle CSS fullscreen class
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <motion.section 
      className="webcam-section-enhanced"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="webcam-header-enhanced">
        <div className="webcam-title-section">
          <div className="webcam-icon-wrapper">
            <Camera className="w-6 h-6 text-blue-400" />
          </div>
          <div className="webcam-title-info">
            <h3 className="webcam-title">Live Camera Feed</h3>
            <p className="webcam-subtitle">Real-time printer monitoring</p>
          </div>
        </div>
        
        <div className="webcam-status-badge">
          <div className={`status-dot ${isStreaming ? 'streaming' : 'offline'}`} />
          <span className="status-text">
            {isStreaming ? 'STREAMING' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      <div 
        className={`webcam-container-enhanced ${isFullscreen ? 'fullscreen-mode' : ''}`}
        ref={containerRef}
      >
        {isStreaming ? (
          <motion.div 
            className="webcam-feed-active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="stream-wrapper-enhanced">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/73-EekdVVU8?autoplay=1&mute=1"
                title="Brooks Falls - Katmai National Park, Alaska 2025 powered by EXPLORE.org"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="stream-iframe"
              />
              
              {/* Stream Overlays */}
              <div className="stream-overlay-top">
                <div className="stream-info-badge">
                  <div className="live-indicator">
                    <div className="live-dot" />
                    <span>LIVE</span>
                  </div>
                  <span className="stream-title">Brooks Falls, Alaska</span>
                </div>
                
                <div className="stream-quality-badge">
                  <span className="quality-text">{streamQuality}</span>
                </div>
              </div>

              {/* Bottom Controls */}
              <motion.div 
                className="stream-controls-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="controls-left">
                  <motion.button
                    className="control-btn"
                    onClick={handleToggleStream}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={isStreaming ? 'Pause Stream' : 'Resume Stream'}
                  >
                    {isStreaming ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>

                  <motion.button
                    className="control-btn"
                    onClick={() => setIsMuted(!isMuted)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </motion.button>
                </div>

                <div className="controls-center">
                  <div className="stream-timestamp">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>

                <div className="controls-right">
                  <motion.button
                    className="control-btn"
                    onClick={() => {/* Screenshot logic */}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Take Screenshot"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="control-btn"
                    onClick={() => {/* Settings logic */}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Camera Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="control-btn"
                    onClick={handleToggleFullscreen}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="webcam-offline-enhanced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="offline-content">
              <div className="offline-icon-wrapper">
                <CameraOff className="w-16 h-16 text-slate-400" />
                <div className="offline-pulse" />
              </div>
              <h4 className="offline-title">Camera Stream Offline</h4>
              <p className="offline-description">
                The camera feed is currently unavailable. Click below to reconnect.
              </p>
              <motion.button 
                className="reconnect-btn"
                onClick={handleToggleStream}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Stream
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default WebcamSection;
