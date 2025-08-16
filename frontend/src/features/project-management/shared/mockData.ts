/**
 * Mock data for development and fallback scenarios
 * Provides sample data when API calls fail
 */

import { Task, BudgetCategory, BudgetExpense } from '../../../services/project-management-api';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design 3D printer housing',
    description: 'Create the main housing design for the 3D printer project',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 8,
    tags: ['design', 'cad', 'housing'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Source stepper motors',
    description: 'Research and purchase suitable stepper motors',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4,
    tags: ['sourcing', 'electronics', 'motors'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Test print bed adhesion',
    description: 'Complete testing of various bed surfaces and adhesion methods',
    status: 'done',
    priority: 'medium',
    assignee: 'Jane Smith',
    estimatedHours: 6,
    tags: ['testing', 'hardware', 'bed'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockBudgetCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Electronics',
    budgetedAmount: 500,
    currency: 'USD',
    description: 'Stepper motors, control boards, sensors',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Frame & Hardware',
    budgetedAmount: 300,
    currency: 'USD',
    description: 'Aluminum extrusions, bolts, bearings',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Print Materials',
    budgetedAmount: 150,
    currency: 'USD',
    description: 'PLA, PETG, and other filaments',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockBudgetExpenses: BudgetExpense[] = [
  {
    id: '1',
    categoryId: '1',
    description: 'NEMA 17 Stepper Motors (4x)',
    amount: 120,
    currency: 'USD',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    vendor: 'Electronics Supplier Co',
    tags: ['motors', 'stepper'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    categoryId: '2',
    description: '2020 Aluminum Extrusions',
    amount: 85,
    currency: 'USD',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    vendor: 'Hardware Store',
    tags: ['frame', 'aluminum'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    categoryId: '3',
    description: 'PLA Filament (1kg rolls x3)',
    amount: 45,
    currency: 'USD',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    vendor: '3D Print Materials',
    tags: ['filament', 'pla'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
