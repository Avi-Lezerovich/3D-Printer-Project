import React from 'react'

interface SpinnerProps {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  centered?: boolean;
}

export default function Spinner({ 
  label = 'Loading…', 
  size = 'medium',
  variant = 'primary',
  centered = false
}: SpinnerProps) {
  const sizeMap = {
    small: { width: 16, height: 16, borderWidth: 2 },
    medium: { width: 24, height: 24, borderWidth: 3 },
    large: { width: 32, height: 32, borderWidth: 4 }
  };

  const colorMap = {
    primary: {
      border: 'rgba(0, 174, 240, 0.2)',
      borderTop: 'linear-gradient(135deg, #00aef0, #37d67a)',
      text: '#c9e3ff'
    },
    secondary: {
      border: 'rgba(55, 214, 122, 0.2)',
      borderTop: 'linear-gradient(135deg, #37d67a, #00aef0)',
      text: '#b3d9ff'
    }
  };

  const { width, height, borderWidth } = sizeMap[size];
  const colors = colorMap[variant];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: centered ? 48 : 24,
    ...(centered && {
      justifyContent: 'center',
      minHeight: '200px',
      flexDirection: 'column'
    })
  };

  const spinnerStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: '50%',
    border: `${borderWidth}px solid ${colors.border}`,
    borderTop: `${borderWidth}px solid transparent`,
    background: colors.borderTop,
    backgroundClip: 'padding-box',
    animation: 'professionalSpin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    display: 'inline-block',
    position: 'relative',
    boxShadow: `0 0 20px rgba(0, 174, 240, 0.3)`
  };

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={spinnerStyle} aria-hidden="true" />
      <span style={{ 
        color: colors.text, 
        fontSize: size === 'large' ? '1.1rem' : '1rem',
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}>
        {label}
      </span>
      <style>{`
        @keyframes professionalSpin { 
          0% { 
            transform: rotate(0deg) scale(1); 
            opacity: 1;
          } 
          50% {
            transform: rotate(180deg) scale(1.05);
            opacity: 0.8;
          }
          100% { 
            transform: rotate(360deg) scale(1);
            opacity: 1;
          } 
        }
      `}</style>
    </div>
  )
}
