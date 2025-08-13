import React from 'react';

interface StatusDisplayProps {
  status: string;
  statusColor: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, statusColor }) => {
  return (
    <div className="panel status-display">
      <div className="status-indicator" style={{ background: statusColor }} />
      <span>Status: <b style={{ color: statusColor }}>{status}</b></span>
    </div>
  );
};

export default StatusDisplay;
