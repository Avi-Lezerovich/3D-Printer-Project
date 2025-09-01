import React from 'react';

interface TemperatureDisplayProps {
  label: string;
  temperature: number;
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({ label, temperature }) => {
  return (
    <div className="panel temperature-display">
      {label}: <b>{temperature}°C</b>
    </div>
  );
};

export default TemperatureDisplay;
