import React from 'react';
import { 
  Play, Pause, Volume2, VolumeX, ZoomIn, ZoomOut,
  RotateCcw, Settings, Download, Circle, Square
} from 'lucide-react';

interface WebcamControlsProps {
  isStreaming: boolean;
  isMuted: boolean;
  isRecording: boolean;
  zoom: number;
  onToggleStream: () => void;
  onToggleMute: () => void;
  onToggleRecording: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onShowSettings: () => void;
  onTakeSnapshot: () => void;
}

const WebcamControls: React.FC<WebcamControlsProps> = ({
  isStreaming,
  isMuted,
  isRecording,
  zoom,
  onToggleStream,
  onToggleMute,
  onToggleRecording,
  onZoomIn,
  onZoomOut,
  onResetView,
  onShowSettings,
  onTakeSnapshot
}) => {
  return (
    <div className="webcam-controls">
      <div className="controls-section">
        <h4>Stream</h4>
        <div className="control-group">
          <button
            onClick={onToggleStream}
            className={`control-btn ${isStreaming ? 'active' : ''}`}
            title={isStreaming ? 'Stop stream' : 'Start stream'}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isStreaming ? 'Stop' : 'Start'}
          </button>
          
          <button
            onClick={onToggleMute}
            className={`control-btn ${!isMuted ? 'active' : ''}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h4>View</h4>
        <div className="control-group">
          <button
            onClick={onZoomIn}
            className="control-btn"
            disabled={zoom >= 200}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <span className="zoom-level">{zoom}%</span>
          
          <button
            onClick={onZoomOut}
            className="control-btn"
            disabled={zoom <= 50}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={onResetView}
            className="control-btn"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h4>Capture</h4>
        <div className="control-group">
          <button
            onClick={onToggleRecording}
            className={`control-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            {isRecording ? 'Stop' : 'Record'}
          </button>
          
          <button
            onClick={onTakeSnapshot}
            className="control-btn"
            title="Take snapshot"
          >
            <Download className="w-4 h-4" />
            Snapshot
          </button>
        </div>
      </div>

      <div className="controls-section">
        <button
          onClick={onShowSettings}
          className="control-btn settings-btn"
          title="Webcam settings"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
};

export default WebcamControls;