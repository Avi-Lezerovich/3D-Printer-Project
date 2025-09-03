/**
 * Portfolio Business Logic Hook
 * 
 * Professional hook for managing portfolio dashboard state and operations.
 * Implements clean separation of concerns with comprehensive error handling.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { 
  PortfolioState, 
  QuickStat, 
  ActivityItem, 
  SystemStatus,
  PortfolioService 
} from '../types';
import { portfolioService } from '../services';

interface UsePortfolioOptions {
  readonly initialData?: Partial<PortfolioState>;
  readonly refetchInterval?: number;
  readonly enabled?: boolean;
}

interface UsePortfolioReturn {
  readonly state: PortfolioState;
  readonly actions: {
    readonly refreshStats: () => Promise<void>;
    readonly refreshActivities: () => Promise<void>;
    readonly refreshSystemStatus: () => Promise<void>;
    readonly refreshAll: () => Promise<void>;
  };
  readonly isLoading: boolean;
  readonly error: string | null;
}

/**
 * Professional portfolio management hook with enterprise-grade patterns
 */
export const usePortfolio = (options: UsePortfolioOptions = {}): UsePortfolioReturn => {
  const { 
    initialData, 
    refetchInterval = 30000, // 30 seconds
    enabled = true 
  } = options;

  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for stats with optimistic updates
  const statsQuery = useQuery({
    queryKey: ['portfolio', 'stats'],
    queryFn: portfolioService.getStats,
    refetchInterval,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      setError(`Failed to load stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Query for activities
  const activitiesQuery = useQuery({
    queryKey: ['portfolio', 'activities'],
    queryFn: portfolioService.getActivities,
    refetchInterval,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      setError(`Failed to load activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Query for system status with more frequent updates
  const systemStatusQuery = useQuery({
    queryKey: ['portfolio', 'systemStatus'],
    queryFn: portfolioService.getSystemStatus,
    refetchInterval: 10000, // 10 seconds for system status
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    onError: (error) => {
      setError(`Failed to load system status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Memoized portfolio state
  const state = useMemo<PortfolioState>(() => ({
    stats: statsQuery.data || initialData?.stats || [],
    features: initialData?.features || [], // Static features
    activities: activitiesQuery.data || initialData?.activities || [],
    systemStatus: systemStatusQuery.data || initialData?.systemStatus || {
      connectivity: 'disconnected',
      temperature: { current: 0, target: 0, unit: 'celsius' },
      storage: { used: 0, total: 0, unit: 'GB', percentage: 0 },
      printStatus: 'idle',
    },
    isLoading: statsQuery.isLoading || activitiesQuery.isLoading || systemStatusQuery.isLoading,
    error,
    lastUpdated: new Date().toISOString(),
  }), [
    statsQuery.data,
    statsQuery.isLoading,
    activitiesQuery.data,
    activitiesQuery.isLoading,
    systemStatusQuery.data,
    systemStatusQuery.isLoading,
    initialData,
    error,
  ]);

  // Memoized action handlers
  const actions = useMemo(() => ({
    refreshStats: async (): Promise<void> => {
      try {
        setError(null);
        await queryClient.invalidateQueries(['portfolio', 'stats']);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh stats';
        setError(message);
        throw new Error(message);
      }
    },

    refreshActivities: async (): Promise<void> => {
      try {
        setError(null);
        await queryClient.invalidateQueries(['portfolio', 'activities']);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh activities';
        setError(message);
        throw new Error(message);
      }
    },

    refreshSystemStatus: async (): Promise<void> => {
      try {
        setError(null);
        await queryClient.invalidateQueries(['portfolio', 'systemStatus']);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh system status';
        setError(message);
        throw new Error(message);
      }
    },

    refreshAll: async (): Promise<void> => {
      try {
        setError(null);
        await Promise.all([
          queryClient.invalidateQueries(['portfolio', 'stats']),
          queryClient.invalidateQueries(['portfolio', 'activities']),
          queryClient.invalidateQueries(['portfolio', 'systemStatus']),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh dashboard';
        setError(message);
        throw new Error(message);
      }
    },
  }), [queryClient]);

  // Clear errors on successful data fetch
  useEffect(() => {
    if (statsQuery.isSuccess && activitiesQuery.isSuccess && systemStatusQuery.isSuccess) {
      setError(null);
    }
  }, [statsQuery.isSuccess, activitiesQuery.isSuccess, systemStatusQuery.isSuccess]);

  return {
    state,
    actions,
    isLoading: state.isLoading,
    error: state.error,
  };
};

/**
 * Hook for managing real-time portfolio updates
 */
export const usePortfolioRealtime = () => {
  const queryClient = useQueryClient();

  const updateStats = useCallback((newStats: readonly QuickStat[]) => {
    queryClient.setQueryData(['portfolio', 'stats'], newStats);
  }, [queryClient]);

  const updateActivities = useCallback((newActivities: readonly ActivityItem[]) => {
    queryClient.setQueryData(['portfolio', 'activities'], newActivities);
  }, [queryClient]);

  const updateSystemStatus = useCallback((newStatus: SystemStatus) => {
    queryClient.setQueryData(['portfolio', 'systemStatus'], newStatus);
  }, [queryClient]);

  return {
    updateStats,
    updateActivities,
    updateSystemStatus,
  };
};