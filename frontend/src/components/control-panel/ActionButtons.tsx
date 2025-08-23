import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Pause, AlertTriangle } from 'lucide-react';

interface ActionButtonsProps {
  onPrint: () => void;
  onStop: () => void;
  onPause: () => void;
  disabled: boolean;
  status: 'idle' | 'printing' | 'paused' | 'error';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onPrint, 
  onStop, 
  onPause, 
  disabled,
  status = 'idle'
}) => {
  const buttonVariants = {
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'printing': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'printing': return 'bg-green-500/10';
      case 'paused': return 'bg-yellow-500/10';
      case 'error': return 'bg-red-500/10';
      default: return 'bg-slate-500/10';
    }
  };

  return (
    <section className="action-buttons-section">
      <div className="action-header">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Play className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Print Controls</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Status:</span>
              <div className={`status-indicator ${getStatusBg()} ${getStatusColor()}`}>
                {status === 'printing' && <Play className="w-4 h-4" />}
                {status === 'paused' && <Pause className="w-4 h-4" />}
                {status === 'error' && <AlertTriangle className="w-4 h-4" />}
                {status === 'idle' && <Square className="w-4 h-4" />}
                <span className="capitalize font-medium">{status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons-grid">
        {status === 'idle' && (
          <motion.button 
            className="action-btn primary-action"
            onClick={onPrint} 
            disabled={disabled}
            variants={buttonVariants}
            whileHover={disabled ? {} : "hover"}
            whileTap={disabled ? {} : "tap"}
          >
            <div className="action-btn-content">
              <div className="action-btn-icon bg-green-500/20">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <div className="action-btn-text">
                <div className="action-btn-title">Start Print</div>
                <div className="action-btn-subtitle">Begin printing job</div>
              </div>
            </div>
          </motion.button>
        )}

        {status === 'printing' && (
          <>
            <motion.button 
              className="action-btn warning-action"
              onClick={onPause} 
              disabled={disabled}
              variants={buttonVariants}
              whileHover={disabled ? {} : "hover"}
              whileTap={disabled ? {} : "tap"}
            >
              <div className="action-btn-content">
                <div className="action-btn-icon bg-yellow-500/20">
                  <Pause className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="action-btn-text">
                  <div className="action-btn-title">Pause</div>
                  <div className="action-btn-subtitle">Temporarily stop</div>
                </div>
              </div>
            </motion.button>
            
            <motion.button 
              className="action-btn danger-action"
              onClick={onStop} 
              disabled={disabled}
              variants={buttonVariants}
              whileHover={disabled ? {} : "hover"}
              whileTap={disabled ? {} : "tap"}
            >
              <div className="action-btn-content">
                <div className="action-btn-icon bg-red-500/20">
                  <Square className="w-5 h-5 text-red-400" />
                </div>
                <div className="action-btn-text">
                  <div className="action-btn-title">Stop</div>
                  <div className="action-btn-subtitle">End print job</div>
                </div>
              </div>
            </motion.button>
          </>
        )}

        {status === 'paused' && (
          <>
            <motion.button 
              className="action-btn primary-action"
              onClick={onPrint} 
              disabled={disabled}
              variants={buttonVariants}
              whileHover={disabled ? {} : "hover"}
              whileTap={disabled ? {} : "tap"}
            >
              <div className="action-btn-content">
                <div className="action-btn-icon bg-green-500/20">
                  <Play className="w-5 h-5 text-green-400" />
                </div>
                <div className="action-btn-text">
                  <div className="action-btn-title">Resume</div>
                  <div className="action-btn-subtitle">Continue printing</div>
                </div>
              </div>
            </motion.button>
            
            <motion.button 
              className="action-btn danger-action"
              onClick={onStop} 
              disabled={disabled}
              variants={buttonVariants}
              whileHover={disabled ? {} : "hover"}
              whileTap={disabled ? {} : "tap"}
            >
              <div className="action-btn-content">
                <div className="action-btn-icon bg-red-500/20">
                  <Square className="w-5 h-5 text-red-400" />
                </div>
                <div className="action-btn-text">
                  <div className="action-btn-title">Stop</div>
                  <div className="action-btn-subtitle">End print job</div>
                </div>
              </div>
            </motion.button>
          </>
        )}
      </div>
    </section>
  );
};

export default ActionButtons;
