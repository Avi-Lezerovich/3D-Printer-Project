import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

interface ValidationState {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'success' | 'warning';
}

interface EnhancedInputProps {
  type?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  validation?: ValidationState;
  rows?: number;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({ 
  type = 'text', 
  id, 
  value, 
  onChange, 
  label, 
  placeholder, 
  validation,
  rows 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="settings-input floating-label">
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`floating-input ${validation && !validation.isValid ? 'error' : ''} ${validation?.isValid ? 'success' : ''}`}
        />
      ) : (
        <div className="input-wrapper">
          <input
            type={inputType}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`floating-input ${validation && !validation.isValid ? 'error' : ''} ${validation?.isValid ? 'success' : ''}`}
          />
          {type === 'password' && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
      <label htmlFor={id} className="floating-label-text">
        {label}
      </label>
      {validation && (
        <div className={`validation-message ${validation.type}`}>
          {validation.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {validation.type === 'success' && <Check className="w-4 h-4" />}
          <span>{validation.message}</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedInput;