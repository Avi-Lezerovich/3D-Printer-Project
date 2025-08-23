import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import TemperatureControls from '../../components/control-panel/TemperatureControls';
import ActionButtons from '../../components/control-panel/ActionButtons';
import Modal from '../../components/Modal';
import { Settings, Home, Wrench } from 'lucide-react';

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
    if (status === 'paused') {
      setStatus('printing');
    } else {
      setStatus('printing');
    }
  };

  const handleStop = () => {
    setShowStop(true);
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const confirmStop = () => {
    setStatus('idle');
    setShowStop(false);
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
    <motion.div 
      className="controls-section-enhanced"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
        <ActionButtons
          onPrint={handlePrint}
          onStop={handleStop}
          onPause={handlePause}
          disabled={!connected}
          status={status}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="manual-controls-section">
          <div className="section-header">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Manual Controls</h3>
                <p className="text-sm text-slate-400">Direct printer operations</p>
              </div>
            </div>
          </div>
          
          <div className="manual-controls-grid">
            <motion.button 
              className="manual-control-btn"
              disabled={!connected}
              whileHover={{ scale: !connected ? 1 : 1.02 }}
              whileTap={{ scale: !connected ? 1 : 0.98 }}
            >
              <div className="manual-btn-content">
                <div className="manual-btn-icon bg-blue-500/20">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <div className="manual-btn-text">
                  <div className="manual-btn-title">Home All</div>
                  <div className="manual-btn-subtitle">Move to origin</div>
                </div>
              </div>
            </motion.button>

            <motion.button 
              className="manual-control-btn"
              disabled={!connected}
              whileHover={{ scale: !connected ? 1 : 1.02 }}
              whileTap={{ scale: !connected ? 1 : 0.98 }}
            >
              <div className="manual-btn-content">
                <div className="manual-btn-icon bg-green-500/20">
                  <Settings className="w-5 h-5 text-green-400" />
                </div>
                <div className="manual-btn-text">
                  <div className="manual-btn-title">Auto Level</div>
                  <div className="manual-btn-subtitle">Calibrate bed</div>
                </div>
              </div>
            </motion.button>

            <motion.button 
              className="manual-control-btn"
              disabled={!connected}
              whileHover={{ scale: !connected ? 1 : 1.02 }}
              whileTap={{ scale: !connected ? 1 : 0.98 }}
            >
              <div className="manual-btn-content">
                <div className="manual-btn-icon bg-orange-500/20">
                  <Wrench className="w-5 h-5 text-orange-400" />
                </div>
                <div className="manual-btn-text">
                  <div className="manual-btn-title">Load Filament</div>
                  <div className="manual-btn-subtitle">Insert material</div>
                </div>
              </div>
            </motion.button>

            <motion.button 
              className="manual-control-btn"
              disabled={!connected}
              whileHover={{ scale: !connected ? 1 : 1.02 }}
              whileTap={{ scale: !connected ? 1 : 0.98 }}
            >
              <div className="manual-btn-content">
                <div className="manual-btn-icon bg-red-500/20">
                  <Wrench className="w-5 h-5 text-red-400" />
                </div>
                <div className="manual-btn-text">
                  <div className="manual-btn-title">Unload Filament</div>
                  <div className="manual-btn-subtitle">Remove material</div>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Modal
        open={showStop}
        onClose={() => setShowStop(false)}
        title="⚠️ Stop Print Job"
        confirmText="Stop Print"
        onConfirm={confirmStop}
      >
        <p>Are you sure you want to stop the current print job?</p>
        <p className="warning-text">This action cannot be undone and will waste the current print.</p>
      </Modal>
    </motion.div>
  );
};

export default ControlsSection;
