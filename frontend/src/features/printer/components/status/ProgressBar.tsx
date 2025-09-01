
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Layers, Percent } from 'lucide-react';

interface ProgressBarProps {
  progress?: number;
  timeRemaining?: string;
  currentLayer?: number;
  totalLayers?: number;
  fileName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 35,
  timeRemaining = '01:25:43',
  currentLayer = 45,
  totalLayers = 127,
  fileName = 'awesome_model.gcode'
}) => {
  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#3b82f6'; // blue
    if (progress < 70) return '#f59e0b'; // amber
    return '#10b981'; // emerald
  };

  return (
    <div className="progress-section-enhanced">
      <div className="progress-header">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
            <Percent className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Print Progress</h3>
            <p className="text-sm text-slate-400 truncate max-w-xs">{fileName}</p>
          </div>
        </div>
        <div className="progress-percentage">
          <span className="text-2xl font-bold text-white">{progress}</span>
          <span className="text-slate-400">%</span>
        </div>
      </div>

      <div className="progress-bar-enhanced">
        <div className="progress-track">
          <motion.div 
            className="progress-fill-enhanced" 
            style={{ 
              background: `linear-gradient(90deg, ${getProgressColor(progress)}, ${getProgressColor(progress)}dd)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="progress-glow" style={{ left: `${progress}%` }} />
        </div>
        
        <div className="progress-markers">
          {[25, 50, 75].map((marker) => (
            <div 
              key={marker}
              className={`progress-marker ${progress >= marker ? 'passed' : 'upcoming'}`}
              style={{ left: `${marker}%` }}
            >
              <div className="marker-line" />
              <div className="marker-label">{marker}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <div className="stat-icon bg-blue-500/20">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Time Remaining</div>
            <div className="stat-value text-blue-400">{timeRemaining}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon bg-green-500/20">
            <Layers className="w-4 h-4 text-green-400" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Current Layer</div>
            <div className="stat-value text-green-400">{currentLayer} / {totalLayers}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon bg-purple-500/20">
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="stat-info">
            <div className="stat-label">Speed</div>
            <div className="stat-value text-purple-400">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
