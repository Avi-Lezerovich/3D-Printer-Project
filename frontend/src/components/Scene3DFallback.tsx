import React from 'react';

interface Scene3DFallbackProps {
  error?: Error;
}

const Scene3DFallback: React.FC<Scene3DFallbackProps> = ({ error }) => {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '500px', 
        borderRadius: '12px', 
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        🖨️
      </div>
      <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>
        3D Preview Unavailable
      </h3>
      <p style={{ color: 'var(--text-soft)', marginBottom: '1rem' }}>
        The interactive 3D printer model couldn&apos;t be loaded, but you can still explore the rest of the portfolio.
      </p>
      {error && process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
            Technical Details
          </summary>
          <code style={{ whiteSpace: 'pre-wrap' }}>
            {error.message}
          </code>
        </details>
      )}
    </div>
  );
};

export default Scene3DFallback;