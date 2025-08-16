import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(()=> new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      }
    }
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
