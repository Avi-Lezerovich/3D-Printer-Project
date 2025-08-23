import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import StatusDisplay from '../../components/control-panel/StatusDisplay';
import ProgressBar from '../../components/control-panel/ProgressBar';

const StatusSection = () => {
  const { status, hotend, bed, connected } = useAppStore((state) => ({
    status: state.status,
    hotend: state.hotend,
    bed: state.bed,
    connected: state.connected,
  }));

  const statusConfig = {
    idle: { color: '#7fb6e6' },
    printing: { color: '#37d67a' },
    paused: { color: '#f5a623' },
    error: { color: '#f44336' },
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StatusDisplay
        status={status}
        statusColor={statusConfig.color}
        connected={connected}
        hotend={hotend}
        bed={bed}
        progress={status === 'printing' ? 35 : 0}
        timeRemaining={status === 'printing' ? '01:25:43' : '--:--'}
      />
      
      {status === 'printing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6"
        >
          <ProgressBar />
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusSection;
