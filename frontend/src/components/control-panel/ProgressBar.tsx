import React from 'react';

const ProgressBar = () => {
  return (
    <div className="panel progress-bar-container">
      <div className="progress-bar-label">Progress</div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: '25%' }} />
      </div>
    </div>
  );
};

export default ProgressBar;
