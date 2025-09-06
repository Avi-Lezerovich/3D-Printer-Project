import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import MovementControls from './components/MovementControls';
import TemperatureControls from './components/TemperatureControls';
import PrintControls from './components/PrintControls';

interface ControlsSectionProps {
  isDemo?: boolean;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({ isDemo = false }) => {
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

  const handleTemperatureChange = (type: 'hotend' | 'bed', target: number) => {
    if (type === 'hotend') {
      setTemps({ hotend: { ...hotend, target }, bed });
    } else {
      setTemps({ hotend, bed: { ...bed, target } });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      <PrintControls 
        status={status}
        connected={connected}
        onStatusChange={setStatus}
        isDemo={isDemo}
      />
      
      <TemperatureControls
        hotend={hotend}
        bed={bed}
        onTemperatureChange={handleTemperatureChange}
        isDemo={isDemo}
      />
      
      <MovementControls isDemo={isDemo} />
    </motion.div>
  );
};

export default ControlsSection;