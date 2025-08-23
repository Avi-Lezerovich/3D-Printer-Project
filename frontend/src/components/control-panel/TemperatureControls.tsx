import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Flame, AlertTriangle } from 'lucide-react';

interface TemperatureControlsProps {
  hotend: number;
  bed: number;
  onHotendChange: (value: number) => void;
  onBedChange: (value: number) => void;
  disabled: boolean;
}

interface MaterialPreset {
  name: string;
  hotend: number;
  bed: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const materialPresets: { [key: string]: MaterialPreset } = {
  PLA: { 
    name: 'PLA',
    hotend: 200, 
    bed: 60, 
    color: 'var(--success)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    description: 'Easy to print, biodegradable' 
  },
  PETG: { 
    name: 'PETG',
    hotend: 235, 
    bed: 80, 
    color: 'var(--info)',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    description: 'Strong, chemical resistant' 
  },
  ABS: { 
    name: 'ABS',
    hotend: 240, 
    bed: 90, 
    color: 'var(--warning)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    description: 'High strength, impact resistant' 
  },
  TPU: {
    name: 'TPU',
    hotend: 220,
    bed: 45,
    color: 'var(--purple)',
    bgColor: 'rgba(147, 51, 234, 0.1)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
    description: 'Flexible, durable elastomer'
  }
};

interface TemperatureControlProps {
  name: string;
  icon: React.ReactNode;
  currentTemp: number;
  targetTemp: number;
  maxTemp: number;
  onTargetChange: (temp: number) => void;
  type: 'hotend' | 'bed';
  disabled?: boolean;
}

const TemperatureControl: React.FC<TemperatureControlProps> = ({
  name,
  icon,
  currentTemp,
  targetTemp,
  maxTemp,
  onTargetChange,
  type,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(targetTemp.toString());
  
  useEffect(() => {
    setInputValue(targetTemp.toString());
  }, [targetTemp]);
  
  const progress = maxTemp > 0 ? Math.min((currentTemp / maxTemp) * 100, 100) : 0;
  const targetProgress = maxTemp > 0 ? Math.min((targetTemp / maxTemp) * 100, 100) : 0;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 0 && value <= maxTemp) {
      onTargetChange(value);
    } else {
      setInputValue(targetTemp.toString());
    }
  };
  
  const handleIncrement = (amount: number) => {
    const newTemp = Math.max(0, Math.min(maxTemp, targetTemp + amount));
    onTargetChange(newTemp);
    setInputValue(newTemp.toString());
  };
  
  const getStatusBadge = () => {
    const diff = Math.abs(currentTemp - targetTemp);
    if (targetTemp === 0) return { text: 'Off', className: 'neutral' };
    if (diff <= 5 && currentTemp >= targetTemp - 5) return { text: 'Ready', className: 'success' };
    if (currentTemp < targetTemp) return { text: 'Heating', className: 'warning' };
    if (currentTemp > targetTemp + 10) return { text: 'Cooling', className: 'info' };
    return { text: 'Stable', className: 'success' };
  };
  
  const status = getStatusBadge();
  
  return (
    <motion.div
      className="temp-control-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="temp-card-header">
        <div className="temp-control-header">
          <div className="temp-control-icon">
            {icon}
          </div>
          <div className="temp-control-info">
            <h4 className="temp-control-name">{name}</h4>
            <div className="temp-display">
              <span className="current-temp">{currentTemp.toFixed(1)}°</span>
              <span className="temp-separator">/</span>
              <span className="target-temp">{targetTemp}°</span>
            </div>
          </div>
        </div>
        <div className={`status-badge ${status.className}`}>
          {status.text}
        </div>
      </div>
      
      <div className="temp-progress-bar">
        <div 
          className={`temp-progress-fill ${type}-progress`}
          style={{ 
            width: `${Math.max(progress, targetProgress)}%`,
            opacity: progress < targetProgress ? 0.6 : 1
          }}
        />
        {targetProgress !== progress && (
          <div 
            className="temp-target-indicator"
            style={{ 
              left: `${targetProgress}%`,
              position: 'absolute',
              width: '2px',
              height: '100%',
              background: 'var(--text-primary)',
              opacity: 0.8
            }}
          />
        )}
      </div>
      
      <div className="temp-input-controls">
        <button 
          className="temp-btn"
          onClick={() => handleIncrement(-10)}
          disabled={disabled || targetTemp <= 0}
        >
          -10
        </button>
        <button 
          className="temp-btn"
          onClick={() => handleIncrement(-1)}
          disabled={disabled || targetTemp <= 0}
        >
          -1
        </button>
        <input
          type="number"
          className="temp-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          min="0"
          max={maxTemp}
          placeholder="0"
        />
        <button 
          className="temp-btn"
          onClick={() => handleIncrement(1)}
          disabled={disabled || targetTemp >= maxTemp}
        >
          +1
        </button>
        <button 
          className="temp-btn"
          onClick={() => handleIncrement(10)}
          disabled={disabled || targetTemp >= maxTemp - 10}
        >
          +10
        </button>
      </div>
    </motion.div>
  );
};

const TemperatureControls: React.FC<TemperatureControlsProps> = ({ 
  hotend, 
  bed, 
  onHotendChange, 
  onBedChange, 
  disabled 
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [hotendTarget, setHotendTarget] = useState(200);
  const [bedTarget, setBedTarget] = useState(60);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const handlePresetSelect = (presetKey: string) => {
    const preset = materialPresets[presetKey];
    setSelectedMaterial(presetKey);
    setHotendTarget(preset.hotend);
    setBedTarget(preset.bed);
    onHotendChange(preset.hotend);
    onBedChange(preset.bed);
  };

  const handleEmergencyStop = () => {
    if (showEmergencyConfirm) {
      setHotendTarget(0);
      setBedTarget(0);
      onHotendChange(0);
      onBedChange(0);
      setSelectedMaterial(null);
      setShowEmergencyConfirm(false);
    } else {
      setShowEmergencyConfirm(true);
      setTimeout(() => setShowEmergencyConfirm(false), 3000);
    }
  };

  return (
    <div className="temp-control-enhanced">
      <div className="temp-control-header">
        <h3>Temperature Control</h3>
        <motion.button
          className={`btn ${showEmergencyConfirm ? 'btn-danger-confirm' : 'btn-danger'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEmergencyStop}
          disabled={disabled}
        >
          <AlertTriangle size={16} />
          {showEmergencyConfirm ? 'Confirm Stop' : 'Emergency Stop'}
        </motion.button>
      </div>

      <div className="material-presets">
        <h4>Material Presets</h4>
        <div className="preset-buttons">
          {Object.entries(materialPresets).map(([key, preset]) => (
            <motion.button
              key={key}
              className={`preset-btn ${selectedMaterial === key ? 'active' : ''}`}
              onClick={() => handlePresetSelect(key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              style={{
                '--preset-color': preset.color,
                '--preset-bg': preset.bgColor,
                '--preset-border': preset.borderColor,
              } as React.CSSProperties}
            >
              <div className="preset-material-name">{preset.name}</div>
              <div className="preset-temps">
                H: {preset.hotend}° B: {preset.bed}°
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="temp-controls-grid">
        <TemperatureControl
          name="Hotend"
          icon={<Flame size={20} />}
          currentTemp={hotend}
          targetTemp={hotendTarget}
          maxTemp={300}
          onTargetChange={(temp) => {
            setHotendTarget(temp);
            onHotendChange(temp);
          }}
          type="hotend"
          disabled={disabled}
        />
        
        <TemperatureControl
          name="Heated Bed"
          icon={<Thermometer size={20} />}
          currentTemp={bed}
          targetTemp={bedTarget}
          maxTemp={120}
          onTargetChange={(temp) => {
            setBedTarget(temp);
            onBedChange(temp);
          }}
          type="bed"
          disabled={disabled}
        />
      </div>

      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            className="material-info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="material-info-content">
              <h5>{materialPresets[selectedMaterial].name} Settings Active</h5>
              <p>{materialPresets[selectedMaterial].description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemperatureControls;
