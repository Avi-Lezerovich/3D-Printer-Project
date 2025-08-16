import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const WebcamSection = () => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
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

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
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
    <section className="panel webcam-section">
      <div className="webcam-header">
        <h2>🎥 Live Camera Feed</h2>
        <div className="webcam-controls">
          <button 
            className={`btn btn-small ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleToggleStream}
            title={isStreaming ? 'Stop Stream' : 'Start Stream'}
          >
            {isStreaming ? '⏸️' : '▶️'}
          </button>
          <button 
            className="btn btn-small btn-secondary"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '↙' : '↗'}
          </button>
        </div>
      </div>
      
      <div 
        className={`webcam-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
        ref={containerRef}
      >
        {isStreaming ? (
          <motion.div 
            className="webcam-feed-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="stream-wrapper">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/73-EekdVVU8?autoplay=1&mute=1"
                title="Brooks Falls - Katmai National Park, Alaska 2025 powered by EXPLORE.org"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="feed-overlay">
              <div className="feed-status">
                <span className="status-dot live"></span>
                LIVE - Brooks Falls, Alaska
              </div>
              <div className="stream-info">
                <span className="stream-quality">HD</span>
                <span className="powered-by">EXPLORE.org</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="webcam-offline">
            <span className="offline-icon">📴</span>
            <p>Camera Stream Offline</p>
            <button className="btn btn-primary" onClick={handleToggleStream}>
              Start Stream
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default WebcamSection;
