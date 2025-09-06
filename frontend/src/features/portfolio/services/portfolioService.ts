/**
 * Portfolio Service - Professional API Service Layer
 * 
 * Enterprise-grade service for portfolio data management with proper
 * error handling, caching, and type safety.
 */

import type { 
  PortfolioService, 
  QuickStat, 
  ActivityItem, 
  SystemStatus,
  PortfolioState 
} from '../types';

import { 
  Printer, CheckCircle, Clock, TrendingUp, 
  Play, Settings, AlertTriangle, Upload
} from 'lucide-react';

/**
 * Professional Portfolio Service Implementation
 */
class PortfolioServiceImpl implements PortfolioService {
  private readonly baseUrl = '/api/v2/portfolio';
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  /**
   * Get portfolio statistics with caching
   */
  async getStats(): Promise<readonly QuickStat[]> {
    const cacheKey = 'portfolio-stats';
    const cached = this.getFromCache<readonly QuickStat[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // For now, return mock data - replace with actual API call
      const stats: readonly QuickStat[] = [
        {
          title: 'Active Printers',
          value: '3',
          change: '+1',
          icon: Printer,
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
          title: 'Print Hours',
          value: '2,340',
          change: '+8%',
          icon: Clock,
          color: 'purple',
          trend: 'up'
        },
        {
          title: 'Success Rate',
          value: '96.2%',
          change: '+2.1%',
          icon: TrendingUp,
          color: 'orange',
          trend: 'up'
        }
      ];

      this.setCache(cacheKey, stats, 5 * 60 * 1000); // 5 minutes cache
      return stats;

      // Future API implementation:
      // const response = await fetch(`${this.baseUrl}/stats`);
      // if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
      // const data = await response.json();
      // this.setCache(cacheKey, data, 5 * 60 * 1000);
      // return data;

    } catch (error) {
      throw new Error(`Failed to fetch portfolio stats: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get recent activities with caching
   */
  async getActivities(): Promise<readonly ActivityItem[]> {
    const cacheKey = 'portfolio-activities';
    const cached = this.getFromCache<readonly ActivityItem[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Mock data - replace with actual API call
      const activities: readonly ActivityItem[] = [
        {
          id: 1,
          type: 'print_completed',
          title: 'Dragon Miniature Completed',
          description: 'High detail fantasy miniature finished successfully',
          timestamp: '5 minutes ago',
          status: 'success',
          icon: CheckCircle,
          color: 'green'
        },
        {
          id: 2,
          type: 'upload',
          title: 'New Model Uploaded',
          description: 'spaceship_hull_v3.gcode ready for printing',
          timestamp: '12 minutes ago',
          status: 'info',
          icon: Upload,
          color: 'blue'
        },
        {
          id: 3,
          type: 'maintenance',
          title: 'Maintenance Reminder',
          description: 'Scheduled nozzle cleaning due in 2 hours',
          timestamp: '1 hour ago',
          status: 'warning',
          icon: Settings,
          color: 'orange'
        },
        {
          id: 4,
          type: 'print_started',
          title: 'Prototype Print Started',
          description: 'gear_assembly_v2.gcode - Estimated 3h 45m',
          timestamp: '2 hours ago',
          status: 'info',
          icon: Play,
          color: 'blue'
        },
        {
          id: 5,
          type: 'error',
          title: 'Temperature Alert Resolved',
          description: 'Bed temperature stabilized at 60°C',
          timestamp: '3 hours ago',
          status: 'success',
          icon: AlertTriangle,
          color: 'green'
        }
      ];

      this.setCache(cacheKey, activities, 2 * 60 * 1000); // 2 minutes cache
      return activities;

    } catch (error) {
      throw new Error(`Failed to fetch portfolio activities: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get system status with minimal caching for real-time data
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const cacheKey = 'portfolio-system-status';
    const cached = this.getFromCache<SystemStatus>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Mock data - replace with actual API call
      const systemStatus: SystemStatus = {
        connectivity: 'connected',
        temperature: {
          current: 24.2,
          target: 25.0,
          unit: 'celsius'
        },
        storage: {
          used: 2.1,
          total: 5.0,
          unit: 'TB',
          percentage: 42
        },
        printStatus: 'printing'
      };

      this.setCache(cacheKey, systemStatus, 30 * 1000); // 30 seconds cache
      return systemStatus;

    } catch (error) {
      throw new Error(`Failed to fetch system status: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Refresh entire dashboard data
   */
  async refreshDashboard(): Promise<PortfolioState> {
    try {
      // Clear relevant cache entries
      this.cache.delete('portfolio-stats');
      this.cache.delete('portfolio-activities');
      this.cache.delete('portfolio-system-status');

      // Fetch all data in parallel
      const [stats, activities, systemStatus] = await Promise.all([
        this.getStats(),
        this.getActivities(),
        this.getSystemStatus()
      ]);

      return {
        stats,
        features: [], // Static features
        activities,
        systemStatus,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Failed to refresh dashboard: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Cache management utilities
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error occurred';
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const portfolioService = new PortfolioServiceImpl();

// Export for dependency injection if needed
export { PortfolioServiceImpl };