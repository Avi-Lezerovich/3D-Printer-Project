import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';

const Header = () => {
  const { connected, setConnected, status } = useAppStore((state) => ({
    connected: state.connected,
    setConnected: state.setConnected,
    status: state.status,
  }));

  const handleToggleConnection = () => {
    setConnected(!connected);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.header 
      className="control-panel-main-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <div className="header-left">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            🖨️ Printer Control
          </motion.h1>
          <motion.p 
            className="header-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {getGreeting()}, welcome to your 3D printing dashboard
          </motion.p>
        </div>
        
        <motion.div 
          className="header-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="printer-info">
            <div className="printer-name">
              <span className="printer-icon">🏭</span>
              Ender 3 Pro
            </div>
            <div className="printer-status">
              <div className={`status-dot ${status}`} />
              <span className="status-text">{status.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="connection-section">
            <div className="connection-status">
              <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`} />
              <span className="connection-text">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <motion.button
              className={`btn connection-btn ${connected ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggleConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {connected ? '🔌 Disconnect' : '🔗 Connect'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
