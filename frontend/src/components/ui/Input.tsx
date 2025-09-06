import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ error, className, ...props }) => {
  const baseClasses = 'bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-white w-full';
  const errorClasses = error ? 'border-error' : '';

  return (
    <div>
      <input className={`${baseClasses} ${errorClasses} ${className}`} {...props} />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
};
