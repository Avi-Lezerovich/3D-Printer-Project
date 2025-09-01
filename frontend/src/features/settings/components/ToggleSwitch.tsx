import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => (
  <div className="toggle-container">
    <div className="toggle-content">
      <label htmlFor={id} className="toggle-label">{label}</label>
      {description && <p className="toggle-description">{description}</p>}
    </div>
    <label className="toggle-switch">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

export default ToggleSwitch;