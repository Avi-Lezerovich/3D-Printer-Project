import React from 'react';
import TemperatureInput from './TemperatureInput';

interface TemperatureControlsProps {
  hotend: number;
  bed: number;
  onHotendChange: (value: number) => void;
  onBedChange: (value: number) => void;
  disabled: boolean;
}

const TemperatureControls: React.FC<TemperatureControlsProps> = ({ hotend, bed, onHotendChange, onBedChange, disabled }) => {
  return (
    <section className="panel">
      <h2>Temperature Control</h2>
      <div className="temperature-controls">
        <TemperatureInput
          label="Hotend"
          value={hotend}
          onChange={onHotendChange}
          disabled={disabled}
        />
        <TemperatureInput
          label="Bed"
          value={bed}
          onChange={onBedChange}
          disabled={disabled}
        />
      </div>
    </section>
  );
};

export default TemperatureControls;
