import React from 'react';
import Modal from '../components/Modal';
import { useAppStore } from '../shared/store';
import TemperatureChart from '../components/TemperatureChart';
import FileUpload from '../components/FileUpload';
import ControlPanelHeader from '../components/control-panel/ControlPanelHeader';
import StatusDisplay from '../components/control-panel/StatusDisplay';
import TemperatureDisplay from '../components/control-panel/TemperatureDisplay';
import ProgressBar from '../components/control-panel/ProgressBar';
import TemperatureControls from '../components/control-panel/TemperatureControls';
import ActionButtons from '../components/control-panel/ActionButtons';
import PrintQueue from '../components/control-panel/PrintQueue';
import '../styles/control-panel.css';

export default function ControlPanel() {
  const status = useAppStore((s) => s.status);
  const setStatus = useAppStore((s) => s.setStatus);
  const hotend = useAppStore((s) => s.hotend);
  const bed = useAppStore((s) => s.bed);
  const setTemps = useAppStore((s) => s.setTemps);
  const queue = useAppStore((s) => s.queue);
  const connected = useAppStore((s) => s.connected);
  const setConnected = useAppStore((s) => s.setConnected);
  const [showStop, setShowStop] = React.useState(false);

  const statusColor = {
    idle: '#7fb6e6',
    printing: '#37d67a',
    paused: '#f5a623',
    error: '#f44336',
  }[status];

  const handleToggleConnection = () => {
    setConnected(!connected);
  };

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
    <div className="grid grid-3">
      <section className="panel">
        <ControlPanelHeader
          connected={connected}
          onToggleConnection={handleToggleConnection}
        />
        <div className="control-panel-header-container">
          <StatusDisplay status={status} statusColor={statusColor} />
          <TemperatureDisplay label="Hotend" temperature={hotend} />
          <TemperatureDisplay label="Bed" temperature={bed} />
          <ProgressBar />
        </div>
      </section>

      <FileUpload />

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

      <PrintQueue queue={queue} />

      <section className="panel">
        <h2>Live Temperature Chart</h2>
        <div className="temperature-chart-container">
          <TemperatureChart />
        </div>
      </section>

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
    </div>
  );
}
