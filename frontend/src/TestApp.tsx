import React from 'react';

export const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#0b1620', color: '#e6f1ff', minHeight: '100vh' }}>
      <h1>🚀 Frontend Test</h1>
      <p>✅ React is working</p>
      <p>✅ TypeScript is working</p>
      <p>✅ CSS is loading</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestApp;
