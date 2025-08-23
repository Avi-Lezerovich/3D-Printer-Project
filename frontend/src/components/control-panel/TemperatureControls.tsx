import React from 'react';
import { motion } from 'framer-motion';
import TemperatureInput from './TemperatureInput';
import { Thermometer, Flame, Zap } from 'lucide-react';

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
    PLA: { hotend: 210, bed: 60, color: 'green', description: 'Easy to print' },
    PETG: { hotend: 240, bed: 80, color: 'blue', description: 'Strong & clear' },
    ABS: { hotend: 250, bed: 100, color: 'red', description: 'High strength' },
  };

  const handlePreset = (preset: keyof typeof presetTemperatures) => {
    if (!disabled) {
      const temps = presetTemperatures[preset];
      onHotendChange(temps.hotend);
      onBedChange(temps.bed);
    }
  };

  const getTemperatureStatus = (temp: number, type: 'hotend' | 'bed') => {
    const warningTemp = type === 'hotend' ? 200 : 70;
    
    if (temp === 0) return { status: 'cold', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (temp >= warningTemp) return { status: 'hot', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (temp > 40) return { status: 'warming', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { status: 'cold', color: 'text-blue-400', bg: 'bg-blue-500/10' };
  };

  const hotendStatus = getTemperatureStatus(hotend, 'hotend');
  const bedStatus = getTemperatureStatus(bed, 'bed');

  return (
    <div className="temperature-section">
      <div className="section-header">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <Thermometer className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Temperature Control</h3>
            <p className="text-sm text-slate-400">Set target temperatures for hotend and bed</p>
          </div>
        </div>
        <div className="preset-buttons">
          {Object.entries(presetTemperatures).map(([preset, config]) => {
            const colorClasses = {
              green: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30 text-green-400',
              blue: 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-blue-500/30 text-blue-400',
              red: 'from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-red-500/30 text-red-400'
            };

            return (
              <motion.button
                key={preset}
                className={`preset-btn-enhanced ${colorClasses[config.color as keyof typeof colorClasses]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handlePreset(preset as keyof typeof presetTemperatures)}
                disabled={disabled}
                whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                title={config.description}
              >
                <div className="font-semibold text-sm">{preset}</div>
                <div className="text-xs opacity-75">{config.hotend}°/{config.bed}°C</div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <div className="temperature-controls-grid">
        <div className="temperature-card">
          <div className="temp-card-header">
            <div className={`temp-status-badge ${hotendStatus.bg} ${hotendStatus.color}`}>
              <Flame className="w-4 h-4" />
              <span className="font-medium">Hotend</span>
            </div>
            <div className="temp-current-display">
              <span className="text-2xl font-bold text-white">{hotend}</span>
              <span className="text-slate-400">°C</span>
            </div>
          </div>
          <TemperatureInput
            label="Target Temperature"
            value={hotend}
            onChange={onHotendChange}
            disabled={disabled}
            icon="🔥"
            unit="°C"
            min={0}
            max={300}
            step={5}
          />
        </div>

        <div className="temperature-card">
          <div className="temp-card-header">
            <div className={`temp-status-badge ${bedStatus.bg} ${bedStatus.color}`}>
              <Zap className="w-4 h-4" />
              <span className="font-medium">Heated Bed</span>
            </div>
            <div className="temp-current-display">
              <span className="text-2xl font-bold text-white">{bed}</span>
              <span className="text-slate-400">°C</span>
            </div>
          </div>
          <TemperatureInput
            label="Target Temperature"
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
      </div>
      
      <div className="temperature-actions">
        <motion.button 
          className="temp-action-btn cool-down" 
          disabled={disabled}
          onClick={() => {
            onHotendChange(0);
            onBedChange(0);
          }}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-500/20">
              ❄️
            </div>
            <div>
              <div className="font-semibold">Cool Down</div>
              <div className="text-xs opacity-75">Set all to 0°C</div>
            </div>
          </div>
        </motion.button>
        
        <motion.button 
          className="temp-action-btn preheat" 
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-orange-500/20">
              🔥
            </div>
            <div>
              <div className="font-semibold">Preheat</div>
              <div className="text-xs opacity-75">Start warming up</div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default TemperatureControls;
