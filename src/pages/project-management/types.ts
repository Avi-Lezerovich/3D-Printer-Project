// Shared types for Project Management subpages

export interface ProjectMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  description: string;
}

export interface BudgetItem {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  items: { name: string; cost: number; date: string; }[];
}

export interface InventoryItem {
  name: string;
  current: number | string;
  minimum: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
  supplier?: string;
  estimatedCost?: number;
}

export interface SkillDemonstration {
  skill: string;
  projects: string[];
  proficiency: number;
  evidence: string;
  tools: string[];
}

export type ActiveTab = 'overview' | 'budget' | 'inventory' | 'analytics';
