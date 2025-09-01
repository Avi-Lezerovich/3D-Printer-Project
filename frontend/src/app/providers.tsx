import React from 'react';
import { AppQueryProvider } from '../core/query/QueryProvider';
import { SocketProvider } from '../core/realtime/SocketProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppQueryProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AppQueryProvider>
  );
};