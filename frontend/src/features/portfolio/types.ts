import type { LucideIcon } from 'lucide-react';

export interface PortfolioStats {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  trend: 'up' | 'down' | 'neutral';
}

export interface PortfolioSection {
  id: string;
  title: string;
  description?: string;
  isVisible: boolean;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string | number[];
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}
