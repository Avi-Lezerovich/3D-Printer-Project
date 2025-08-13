import React from 'react';
import { useAppStore } from '../../shared/store';
import TemperatureControls from '../../components/control-panel/TemperatureControls';
import ActionButtons from '../../components/control-panel/ActionButtons';
import Modal from '../../components/Modal';

const ControlsSection = () => {
  const {
    hotend,
    bed,
    setTemps,
    setStatus,
    connected,
  } = useAppStore((state) => ({
    hotend: state.hotend,
    bed: state.bed,
    setTemps: state.setTemps,
    setStatus: state.setStatus,
    connected: state.connected,
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

  return (
    <section className="panel controls-section">
      <TemperatureControls
        hotend={hotend}
        bed={bed}
        onHotendChange={handleHotendChange}
        onBedChange={handleBedChange}
        disabled={!connected}
      />
      <ActionButtons
        onPrint={handlePrint}
        onStop={handleStop}
        onPause={handlePause}
        disabled={!connected}
      />
      <Modal
        open={showStop}
        onClose={() => setShowStop(false)}
        title="Are you sure you want to stop the print?"
        confirmText="Stop Print"
        onConfirm={() => {
          setStatus('idle');
          setShowStop(false);
        }}
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </section>
  );
};

export default ControlsSection;
