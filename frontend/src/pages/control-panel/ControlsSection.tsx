import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import TemperatureControls from '../../components/control-panel/TemperatureControls';
import Modal from '../../components/Modal';

const ControlsSection = () => {
  const {
    hotend,
    bed,
    setTemps,
    setStatus,
    connected,
    status,
  } = useAppStore((state) => ({
    hotend: state.hotend,
    bed: state.bed,
    setTemps: state.setTemps,
    setStatus: state.setStatus,
    connected: state.connected,
    status: state.status,
  }));
  const [showStop, setShowStop] = React.useState(false);

  const handleHotendChange = (value: number) => {
    setTemps(value, bed);
  };

  const handleBedChange = (value: number) => {
    setTemps(hotend, value);
  };

  const handlePrint = () => {
    setStatus('printing');
  };

  const handleStop = () => {
    setShowStop(true);
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('printing');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.section 
      className="panel controls-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="controls-header" variants={itemVariants}>
        <h2>🎛️ Printer Controls</h2>
        <div className="connection-badge">
          <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Online' : 'Offline'}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TemperatureControls
          hotend={hotend}
          bed={bed}
          onHotendChange={handleHotendChange}
          onBedChange={handleBedChange}
          disabled={!connected}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="action-section">
          <h3>Print Actions</h3>
          <div className="action-buttons-enhanced">
            {status === 'idle' && (
              <button 
                className="btn btn-primary action-btn" 
                onClick={handlePrint} 
                disabled={!connected}
              >
                <span className="btn-icon">▶️</span>
                Start Print
              </button>
            )}
            
            {status === 'printing' && (
              <>
                <button 
                  className="btn btn-warning action-btn" 
                  onClick={handlePause} 
                  disabled={!connected}
                >
                  <span className="btn-icon">⏸️</span>
                  Pause
                </button>
                <button 
                  className="btn btn-danger action-btn" 
                  onClick={handleStop} 
                  disabled={!connected}
                >
                  <span className="btn-icon">⏹️</span>
                  Stop
                </button>
              </>
            )}
            
            {status === 'paused' && (
              <>
                <button 
                  className="btn btn-primary action-btn" 
                  onClick={handleResume} 
                  disabled={!connected}
                >
                  <span className="btn-icon">▶️</span>
                  Resume
                </button>
                <button 
                  className="btn btn-danger action-btn" 
                  onClick={handleStop} 
                  disabled={!connected}
                >
                  <span className="btn-icon">⏹️</span>
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="manual-controls">
          <h3>Manual Control</h3>
          <div className="manual-buttons">
            <button className="btn btn-secondary btn-small" disabled={!connected}>
              🏠 Home All
            </button>
            <button className="btn btn-secondary btn-small" disabled={!connected}>
              📐 Auto Level
            </button>
            <button className="btn btn-secondary btn-small" disabled={!connected}>
              🔧 Load Filament
            </button>
            <button className="btn btn-secondary btn-small" disabled={!connected}>
              🔧 Unload Filament
            </button>
          </div>
        </div>
      </motion.div>

      <Modal
        open={showStop}
        onClose={() => setShowStop(false)}
        title="⚠️ Stop Print Job"
        confirmText="Stop Print"
        onConfirm={() => {
          setStatus('idle');
          setShowStop(false);
        }}
      >
        <p>Are you sure you want to stop the current print job?</p>
        <p className="warning-text">This action cannot be undone and will waste the current print.</p>
      </Modal>
    </motion.section>
  );
};

export default ControlsSection;
