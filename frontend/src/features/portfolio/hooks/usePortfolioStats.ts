import { useMemo } from 'react';
import { 
  PrinterIcon, 
  CheckCircle, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import type { PortfolioStats } from '../types';

/**
 * Custom hook for portfolio statistics data
 * Provides centralized state management for portfolio metrics
 */
export function usePortfolioStats() {
  const quickStats: PortfolioStats[] = useMemo(() => [
    {
      title: 'Active Printers',
      value: '3',
      change: '+1 this month',
      icon: PrinterIcon,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Projects Complete',
      value: '847',
      change: '+12%',
      icon: CheckCircle,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'System Uptime',
      value: '99.8%',
      change: '+0.2%',
      icon: Activity,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Print Success Rate',
      value: '94.2%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'orange',
      trend: 'up'
    }
  ], []);

  return {
    quickStats,
    isLoading: false
  };
}

export default usePortfolioStats;
