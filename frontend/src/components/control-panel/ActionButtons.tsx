import React from 'react';

interface ActionButtonsProps {
  onPrint: () => void;
  onStop: () => void;
  onPause: () => void;
  disabled: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPrint, onStop, onPause, disabled }) => {
  return (
    <section className="panel">
      <h2>Print Actions</h2>
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={onPrint} disabled={disabled}>
          Print
        </button>
        <button className="btn btn-danger" onClick={onStop} disabled={disabled}>
          Stop
        </button>
        <button className="btn btn-warning" onClick={onPause} disabled={disabled}>
          Pause
        </button>
      </div>
    </section>
  );
};

export default ActionButtons;
