import React, { useRef } from 'react';
import { CameraOff, Maximize2, Grid3X3 } from 'lucide-react';

interface WebcamViewerProps {
  isStreaming: boolean;
  showGrid: boolean;
  zoom: number;
  onToggleFullscreen: () => void;
  onToggleGrid: () => void;
}

const WebcamViewer: React.FC<WebcamViewerProps> = ({
  isStreaming,
  showGrid,
  zoom,
  onToggleFullscreen,
  onToggleGrid
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="webcam-viewer">
      <div className="webcam-container" style={{ transform: `scale(${zoom / 100})` }}>
        {isStreaming ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              className="webcam-video"
              autoPlay
              muted
              playsInline
            >
              <source src="/api/webcam/stream" type="video/mp4" />
              Your browser does not support video streaming.
            </video>
            
            {showGrid && (
              <div className="grid-overlay">
                <div className="grid-lines">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="grid-line" />
                  ))}
                </div>
              </div>
            )}
            
            <div className="webcam-overlay-controls">
              <button
                onClick={onToggleGrid}
                className={`overlay-btn ${showGrid ? 'active' : ''}`}
                title="Toggle grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={onToggleFullscreen}
                className="overlay-btn"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="webcam-offline">
            <CameraOff className="w-16 h-16 text-gray-400" />
            <p>Camera is offline</p>
            <p className="text-sm text-gray-500">
              Check connection and try again
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamViewer;