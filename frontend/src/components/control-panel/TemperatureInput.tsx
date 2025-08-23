import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

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

  const getTemperatureColor = () => {
    if (value === 0) return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
    if (value >= max * 0.8) return 'from-red-500/20 to-red-600/20 border-red-500/30';
    if (value >= max * 0.5) return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'from-green-500/20 to-green-600/20 border-green-500/30';
  };

  const getFillColor = () => {
    if (value === 0) return '#3b82f6';
    if (value >= max * 0.8) return '#ef4444';
    if (value >= max * 0.5) return '#f97316';
    return '#10b981';
  };

  return (
    <div className="temperature-input-enhanced">
      <div className="temp-input-label">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
      </div>
      
      <div className={`temp-input-container ${getTemperatureColor()}`}>
        <motion.button
          className="temp-control-btn temp-btn-decrease"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        
        <div className="temp-value-section">
          <div className="temp-input-wrapper">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
              disabled={disabled}
              className="temperature-value-input"
              min={min}
              max={max}
              step={step}
            />
            <span className="temp-unit-display">{unit}</span>
          </div>
          
          <div className="temp-range-visual">
            <div className="temp-range-track">
              <div 
                className="temp-range-progress" 
                style={{ 
                  width: `${(value / max) * 100}%`,
                  background: getFillColor()
                }} 
              />
            </div>
            <div className="temp-range-labels">
              <span className="text-xs text-slate-500">{min}°</span>
              <span className="text-xs text-slate-500">{max}°</span>
            </div>
          </div>
        </div>
        
        <motion.button
          className="temp-control-btn temp-btn-increase"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default TemperatureInput;
