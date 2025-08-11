import React from 'react';

interface TemperatureInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

const TemperatureInput: React.FC<TemperatureInputProps> = ({ label, value, onChange, disabled }) => {
  return (
    <label className="temperature-input">
      <span className="temperature-label">{label}:</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="temperature-value"
      />
      <span>°C</span>
    </label>
  );
};

export default TemperatureInput;
