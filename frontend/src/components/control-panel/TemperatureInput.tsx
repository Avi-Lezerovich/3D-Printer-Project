import React from 'react';
import { motion } from 'framer-motion';

interface TemperatureInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  icon?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

const TemperatureInput: React.FC<TemperatureInputProps> = ({ 
  label, 
  value, 
  onChange, 
  disabled,
  icon = '🌡️',
  unit = '°C',
  min = 0,
  max = 300,
  step = 1
}) => {
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  return (
    <div className="temperature-input">
      <div className="temp-input-header">
        <div className="temp-input-icon">{icon}</div>
        <span className="temperature-label">{label}</span>
      </div>
      
      <div className="temp-input-controls">
        <motion.button
          className="temp-btn temp-btn-down"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          −
        </motion.button>
        
        <div className="temp-input-wrapper">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            disabled={disabled}
            className="temperature-value"
            min={min}
            max={max}
            step={step}
          />
          <span className="temp-unit">{unit}</span>
        </div>
        
        <motion.button
          className="temp-btn temp-btn-up"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          +
        </motion.button>
      </div>
      
      <div className="temp-range-indicator">
        <div 
          className="temp-range-fill" 
          style={{ 
            width: `${(value / max) * 100}%`,
            background: value > max * 0.8 ? '#f44336' : value > max * 0.5 ? '#f5a623' : '#37d67a'
          }} 
        />
      </div>
    </div>
  );
};

export default TemperatureInput;
