import React from 'react';
import { motion } from 'framer-motion';
import TemperatureInput from './TemperatureInput';

interface TemperatureControlsProps {
  hotend: number;
  bed: number;
  onHotendChange: (value: number) => void;
  onBedChange: (value: number) => void;
  disabled: boolean;
}

const TemperatureControls: React.FC<TemperatureControlsProps> = ({ 
  hotend, 
  bed, 
  onHotendChange, 
  onBedChange, 
  disabled 
}) => {
  const presetTemperatures = {
    PLA: { hotend: 210, bed: 60 },
    PETG: { hotend: 240, bed: 80 },
    ABS: { hotend: 250, bed: 100 },
  };

  const handlePreset = (preset: keyof typeof presetTemperatures) => {
    if (!disabled) {
      const temps = presetTemperatures[preset];
      onHotendChange(temps.hotend);
      onBedChange(temps.bed);
    }
  };

  return (
    <div className="temperature-section">
      <div className="section-header">
        <h3>🌡️ Temperature Control</h3>
        <div className="preset-buttons">
          {Object.keys(presetTemperatures).map((preset) => (
            <motion.button
              key={preset}
              className="btn btn-small btn-secondary preset-btn"
              onClick={() => handlePreset(preset as keyof typeof presetTemperatures)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
              {preset}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="temperature-controls">
        <TemperatureInput
          label="Hotend"
          value={hotend}
          onChange={onHotendChange}
          disabled={disabled}
          icon="🔥"
          unit="°C"
          min={0}
          max={300}
          step={5}
        />
        <TemperatureInput
          label="Bed"
          value={bed}
          onChange={onBedChange}
          disabled={disabled}
          icon="🛏️"
          unit="°C"
          min={0}
          max={120}
          step={5}
        />
      </div>
      
      <div className="temperature-actions">
        <button 
          className="btn btn-secondary btn-small" 
          disabled={disabled}
          onClick={() => {
            onHotendChange(0);
            onBedChange(0);
          }}
        >
          ❄️ Cool Down
        </button>
        <button 
          className="btn btn-secondary btn-small" 
          disabled={disabled}
        >
          🔥 Preheat
        </button>
      </div>
    </div>
  );
};

export default TemperatureControls;
