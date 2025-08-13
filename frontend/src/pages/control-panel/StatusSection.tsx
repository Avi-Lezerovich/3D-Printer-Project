import { useAppStore } from '../../shared/store';
import StatusDisplay from '../../components/control-panel/StatusDisplay';
import TemperatureDisplay from '../../components/control-panel/TemperatureDisplay';
import ProgressBar from '../../components/control-panel/ProgressBar';

const StatusSection = () => {
  const { status, hotend, bed } = useAppStore((state) => ({
    status: state.status,
    hotend: state.hotend,
    bed: state.bed,
  }));

  const statusColor = {
    idle: '#7fb6e6',
    printing: '#37d67a',
    paused: '#f5a623',
    error: '#f44336',
  }[status];

  return (
    <section className="panel status-section">
      <div className="control-panel-header-container">
        <StatusDisplay status={status} statusColor={statusColor} />
        <TemperatureDisplay label="Hotend" temperature={hotend} />
        <TemperatureDisplay label="Bed" temperature={bed} />
      </div>
      <ProgressBar />
    </section>
  );
};

export default StatusSection;
