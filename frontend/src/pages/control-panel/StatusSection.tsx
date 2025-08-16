import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import ProgressBar from '../../components/control-panel/ProgressBar';

const StatusSection = () => {
  const { status, hotend, bed } = useAppStore((state) => ({
    status: state.status,
    hotend: state.hotend,
    bed: state.bed,
  }));

  const statusConfig = {
    idle: { 
      color: '#7fb6e6', 
      icon: '⏸️', 
      label: 'Ready',
      description: 'Printer is ready for operation'
    },
    printing: { 
      color: '#37d67a', 
      icon: '🖨️', 
      label: 'Printing',
      description: 'Print job in progress'
    },
    paused: { 
      color: '#f5a623', 
      icon: '⏸️', 
      label: 'Paused',
      description: 'Print job temporarily paused'
    },
    error: { 
      color: '#f44336', 
      icon: '⚠️', 
      label: 'Error',
      description: 'Attention required'
    },
  }[status];

  return (
    <section className="panel status-section">
      <motion.div 
        className="status-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>🔍 Printer Status</h2>
        <div className="status-timestamp">
          {new Date().toLocaleTimeString()}
        </div>
      </motion.div>

      <div className="control-panel-header-container">
        <motion.div
          className="status-display-enhanced"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ '--status-color': statusConfig.color } as React.CSSProperties}
        >
          <div className="status-main">
            <div className="status-icon">{statusConfig.icon}</div>
            <div className="status-info">
              <div className="status-label">{statusConfig.label}</div>
              <div className="status-description">{statusConfig.description}</div>
            </div>
          </div>
          <div className="status-indicator-enhanced" />
        </motion.div>

        <motion.div
          className="temperature-grid"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="temperature-display-enhanced">
            <div className="temp-icon">🔥</div>
            <div className="temp-info">
              <div className="temp-label">Hotend</div>
              <div className="temp-value">{hotend}°C</div>
            </div>
            <div className={`temp-status ${hotend > 180 ? 'hot' : hotend > 40 ? 'warm' : 'cool'}`} />
          </div>
          
          <div className="temperature-display-enhanced">
            <div className="temp-icon">🛏️</div>
            <div className="temp-info">
              <div className="temp-label">Bed</div>
              <div className="temp-value">{bed}°C</div>
            </div>
            <div className={`temp-status ${bed > 50 ? 'hot' : bed > 25 ? 'warm' : 'cool'}`} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ProgressBar />
      </motion.div>

      <motion.div
        className="status-metrics"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="metric-item">
          <span className="metric-label">Print Time</span>
          <span className="metric-value">02:34:17</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Est. Remaining</span>
          <span className="metric-value">01:25:43</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Layer</span>
          <span className="metric-value">45 / 127</span>
        </div>
      </motion.div>
    </section>
  );
};

export default StatusSection;
