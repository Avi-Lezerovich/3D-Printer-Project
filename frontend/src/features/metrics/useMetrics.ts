import { useQuery } from '@tanstack/react-query';
import { fetchRuntimeMetrics } from './metricsService';

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: fetchRuntimeMetrics,
    refetchInterval: 5000,
    staleTime: 4000
  });
}
