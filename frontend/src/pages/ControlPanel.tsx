import Header from './control-panel/Header';
import StatusSection from './control-panel/StatusSection';
import ControlsSection from './control-panel/ControlsSection';
import FileUploadSection from './control-panel/FileUploadSection';
import QueueSection from './control-panel/QueueSection';
import ChartSection from './control-panel/ChartSection';
import '../styles/control-panel.css';

export default function ControlPanel() {
  return (
    <div className="control-panel-layout">
      <Header />
      <div className="control-panel-grid">
        <div className="grid-col-span-2">
          <StatusSection />
        </div>
        <ControlsSection />
        <div className="grid-col-span-2">
          <QueueSection />
        </div>
        <FileUploadSection />
        <div className="grid-col-span-3">
          <ChartSection />
        </div>
      </div>
    </div>
  );
}
