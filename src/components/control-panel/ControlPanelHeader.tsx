import React from 'react';

interface ControlPanelHeaderProps {
  connected: boolean;
  onToggleConnection: () => void;
}

const ControlPanelHeader: React.FC<ControlPanelHeaderProps> = ({ connected, onToggleConnection }) => {
  return (
    <div className="control-panel-header">
      <h1>Printer Dashboard</h1>
      <div className="connection-status">
        <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`} />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
        <button
          className={`btn ${connected ? 'btn-danger' : 'btn-primary'}`}
          onClick={onToggleConnection}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanelHeader;
