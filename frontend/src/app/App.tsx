import React from 'react';
import { ErrorBoundary } from '../shared/components/common';
import { AppProviders } from './providers';
import { AppRouter } from './router';

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;