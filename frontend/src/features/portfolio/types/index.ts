/**
 * Portfolio Feature Types - Professional TypeScript Definitions
 * 
 * Comprehensive type definitions for the portfolio dashboard system
 * following enterprise-grade patterns with strict typing.
 */

import type { LucideIcon } from 'lucide-react';

// ========================================
// Core Dashboard Types
// ========================================

export interface QuickStat {
  readonly title: string;
  readonly value: string;
  readonly change: string;
  readonly icon: LucideIcon;
  readonly color: 'blue' | 'green' | 'purple' | 'orange';
  readonly trend: 'up' | 'down';
}

export interface DashboardFeature {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface ActivityItem {
  readonly id: number;
  readonly type: 'print_completed' | 'print_started' | 'maintenance' | 'upload' | 'error';
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly status: 'success' | 'error' | 'warning' | 'info';
  readonly icon: LucideIcon;
  readonly color: string;
}

export interface SystemStatus {
  readonly connectivity: 'connected' | 'disconnected' | 'reconnecting';
  readonly temperature: {
    readonly current: number;
    readonly target: number;
    readonly unit: 'celsius' | 'fahrenheit';
  };
  readonly storage: {
    readonly used: number;
    readonly total: number;
    readonly unit: 'GB' | 'TB';
    readonly percentage: number;
  };
  readonly printStatus: 'idle' | 'printing' | 'paused' | 'completed' | 'error';
}

// ========================================
// Component Props Interfaces
// ========================================

export interface PortfolioContainerProps {
  readonly initialData?: Partial<PortfolioState>;
}

export interface HeroSectionProps {
  readonly title: string;
  readonly subtitle: string;
  readonly isLoading?: boolean;
}

export interface StatsGridProps {
  readonly stats: readonly QuickStat[];
  readonly isLoading?: boolean;
}

export interface StatCardProps {
  readonly stat: QuickStat;
  readonly index: number;
  readonly onClick?: (stat: QuickStat) => void;
}

export interface FeatureGridProps {
  readonly features: readonly DashboardFeature[];
  readonly isLoading?: boolean;
}

export interface FeatureCardProps {
  readonly feature: DashboardFeature;
  readonly index: number;
}

export interface ActivityFeedProps {
  readonly activities: readonly ActivityItem[];
  readonly isLoading?: boolean;
  readonly onViewAll?: () => void;
}

export interface ActivityItemProps {
  readonly activity: ActivityItem;
  readonly index: number;
}

export interface QuickActionsProps {
  readonly onControlPanel?: () => void;
  readonly onUploadFile?: () => void;
  readonly onViewAnalytics?: () => void;
  readonly onSystemSettings?: () => void;
}

export interface SystemStatusProps {
  readonly status: SystemStatus;
  readonly isLoading?: boolean;
}

// ========================================
// State Management
// ========================================

export interface PortfolioState {
  readonly stats: readonly QuickStat[];
  readonly features: readonly DashboardFeature[];
  readonly activities: readonly ActivityItem[];
  readonly systemStatus: SystemStatus;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastUpdated: string;
}

export type PortfolioAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Partial<PortfolioState> }
  | { type: 'FETCH_ERROR'; payload: { error: string } }
  | { type: 'UPDATE_STATS'; payload: readonly QuickStat[] }
  | { type: 'UPDATE_ACTIVITIES'; payload: readonly ActivityItem[] }
  | { type: 'UPDATE_SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'REFRESH_DATA' };

// ========================================
// Service Interfaces
// ========================================

export interface PortfolioService {
  readonly getStats: () => Promise<readonly QuickStat[]>;
  readonly getActivities: () => Promise<readonly ActivityItem[]>;
  readonly getSystemStatus: () => Promise<SystemStatus>;
  readonly refreshDashboard: () => Promise<PortfolioState>;
}

// ========================================
// Utility Types
// ========================================

export type StatColor = 'blue' | 'green' | 'purple' | 'orange';
export type ActivityType = 'print_completed' | 'print_started' | 'maintenance' | 'upload' | 'error';
export type ActivityStatus = 'success' | 'error' | 'warning' | 'info';

// Animation variants types
export interface AnimationVariants {
  readonly hidden: {
    readonly opacity: number;
    readonly y?: number;
  };
  readonly visible: {
    readonly opacity: number;
    readonly y?: number;
    readonly transition?: {
      readonly duration?: number;
      readonly type?: string;
      readonly stiffness?: number;
      readonly damping?: number;
      readonly staggerChildren?: number;
      readonly delayChildren?: number;
    };
  };
}

// Color utility type
export interface ColorConfig {
  readonly blue: readonly [string, string];
  readonly green: readonly [string, string];
  readonly purple: readonly [string, string];
  readonly orange: readonly [string, string];
}