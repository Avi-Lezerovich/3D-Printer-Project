import React from 'react';
import { X, Monitor, Wifi, Activity } from 'lucide-react';

interface WebcamSettingsProps {
  streamQuality: string;
  connectionQuality: number;
  onClose: () => void;
  onQualityChange: (quality: string) => void;
}

const WebcamSettings: React.FC<WebcamSettingsProps> = ({
  streamQuality,
  connectionQuality,
  onClose,
  onQualityChange
}) => {
  return (
    <div className="webcam-settings">
      <div className="settings-header">
        <h3>Webcam Settings</h3>
        <button onClick={onClose} className="close-btn">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="settings-content">
        <div className="setting-group">
          <label className="setting-label">
            <Monitor className="w-4 h-4" />
            Stream Quality
          </label>
          <select
            value={streamQuality}
            onChange={(e) => onQualityChange(e.target.value)}
            className="setting-select"
          >
            <option value="4K">4K (2160p)</option>
            <option value="HD">HD (1080p)</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>

        <div className="setting-group">
          <label className="setting-label">
            <Wifi className="w-4 h-4" />
            Connection Quality
          </label>
          <div className="quality-meter">
            <div 
              className="quality-fill"
              style={{ 
                width: `${connectionQuality}%`,
                backgroundColor: connectionQuality > 80 ? '#10b981' : connectionQuality > 50 ? '#f59e0b' : '#ef4444'
              }}
            />
            <span className="quality-text">{connectionQuality}%</span>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">
            <Activity className="w-4 h-4" />
            Stream Info
          </label>
          <div className="stream-info">
            <div className="info-item">
              <span className="info-label">Resolution:</span>
              <span className="info-value">1920x1080</span>
            </div>
            <div className="info-item">
              <span className="info-label">FPS:</span>
              <span className="info-value">30</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bitrate:</span>
              <span className="info-value">2.5 Mbps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamSettings;