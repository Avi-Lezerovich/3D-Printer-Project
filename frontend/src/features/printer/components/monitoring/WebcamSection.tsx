import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Eye } from 'lucide-react';
import WebcamViewer from './WebcamViewer';
import WebcamControls from './WebcamControls';
import WebcamSettings from './WebcamSettings';

const WebcamSection: React.FC = () => {
  // Stream state
  const [isStreaming, setIsStreaming] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  
  // View state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [streamQuality, setStreamQuality] = useState('HD');
  const [connectionQuality, setConnectionQuality] = useState(85);
  
  // Controls visibility
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen handling
  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 25));
  const handleResetView = () => setZoom(100);

  // Recording controls
  const handleToggleRecording = () => {
    setIsRecording(prev => !prev);
    // Add actual recording logic here
  };

  const handleTakeSnapshot = () => {
    // Add snapshot logic here
    console.log('Taking snapshot...');
  };

  return (
    <div className="panel webcam-section" ref={containerRef}>
      <div className="panel-header">
        <div className="header-left">
          <Camera className="w-5 h-5" />
          <h3>Webcam Monitor</h3>
          <div className="connection-status">
            <div className={`status-dot ${isStreaming ? 'online' : 'offline'}`} />
            <span>{isStreaming ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setShowControls(!showControls)}
            className={`btn-icon ${showControls ? 'active' : ''}`}
            title="Toggle controls"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="panel-content">
        <div className={`webcam-layout ${isFullscreen ? 'fullscreen' : ''}`}>
          <WebcamViewer
            isStreaming={isStreaming}
            showGrid={showGrid}
            zoom={zoom}
            onToggleFullscreen={handleToggleFullscreen}
            onToggleGrid={() => setShowGrid(!showGrid)}
          />

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="webcam-controls-wrapper"
              >
                <WebcamControls
                  isStreaming={isStreaming}
                  isMuted={isMuted}
                  isRecording={isRecording}
                  zoom={zoom}
                  onToggleStream={() => setIsStreaming(!isStreaming)}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onToggleRecording={handleToggleRecording}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onResetView={handleResetView}
                  onShowSettings={() => setShowSettings(true)}
                  onTakeSnapshot={handleTakeSnapshot}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WebcamSettings
              streamQuality={streamQuality}
              connectionQuality={connectionQuality}
              onClose={() => setShowSettings(false)}
              onQualityChange={setStreamQuality}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebcamSection;