import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, elevated = false }) => {
  const baseClasses = 'bg-dark-surface rounded-xl';
  const elevationClasses = elevated ? 'shadow-lg' : '';

  return (
    <div className={`${baseClasses} ${elevationClasses} ${className}`}>
      {children}
    </div>
  );
};
