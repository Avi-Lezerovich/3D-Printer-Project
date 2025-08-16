/**
 * Project Management API Service
 * Follows the research guidelines for secure API communication
 */

import { apiFetch } from './api';

// Types aligned with backend models
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetExpense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptUrl?: string;
  vendor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
  unitCost?: number;
  currency?: string;
  supplier?: string;
  sku?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAnalyticsSummary {
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  budget: {
    total: number;
    spent: number;
    remaining: number;
    utilizationRate: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

// Task Management API
export const taskAPI = {
  async list(filters?: { status?: string; priority?: string; assignee?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    
    const url = `/api/v1/project-management/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const data = await apiFetch(url) as { tasks: Task[] };
  return data.tasks;
  },

  async getById(id: string): Promise<Task> {
  const data = await apiFetch(`/api/v1/project-management/tasks/${id}`) as { task: Task };
  return data.task;
  },

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const data = await apiFetch('/api/v1/project-management/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }) as { task: Task };
    return data.task;
  },

  async update(id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    const data = await apiFetch(`/api/v1/project-management/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }) as { task: Task };
    return data.task;
  },

  async delete(id: string): Promise<void> {
  await apiFetch(`/api/v1/project-management/tasks/${id}`, { method: 'DELETE' });
  }
};

// Budget Management API
export const budgetAPI = {
  async getCategories(): Promise<BudgetCategory[]> {
  const data = await apiFetch('/api/v1/project-management/budget/categories') as { categories: BudgetCategory[] };
  return data.categories;
  },

  async createCategory(categoryData: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetCategory> {
    const data = await apiFetch('/api/v1/project-management/budget/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }) as { category: BudgetCategory };
    return data.category;
  },

  async getExpenses(categoryId?: string): Promise<BudgetExpense[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
  const data = await apiFetch(`/api/v1/project-management/budget/expenses${params}`) as { expenses: BudgetExpense[] };
  return data.expenses;
  }
};

// Inventory Management API
export const inventoryAPI = {
  async list(filters?: { status?: string; supplier?: string }): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    
    const url = `/api/v1/project-management/inventory${params.toString() ? `?${params.toString()}` : ''}`;
  const data = await apiFetch(url) as { items: InventoryItem[] };
  return data.items;
  },

  async create(itemData: Omit<InventoryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const data = await apiFetch('/api/v1/project-management/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }) as { item: InventoryItem };
    return data.item;
  },

  async updateQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const data = await apiFetch(`/api/v1/project-management/inventory/${id}/quantity`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }) as { item: InventoryItem };
    return data.item;
  }
};

// Analytics API
export const analyticsAPI = {
  async getSummary(): Promise<ProjectAnalyticsSummary> {
  const data = await apiFetch('/api/v1/project-management/analytics/summary') as { summary: ProjectAnalyticsSummary };
  return data.summary;
  }
};

// Error handling utility
export class ProjectManagementError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ProjectManagementError';
  }
}

// Input validation utilities (following secure coding principles)
export const validators = {
  validateTaskTitle: (title: string): string => {
    if (!title || title.trim().length === 0) {
      throw new ProjectManagementError('Task title is required');
    }
    if (title.length > 200) {
      throw new ProjectManagementError('Task title cannot exceed 200 characters');
    }
    return title.trim();
  },

  validateDescription: (description: string): string => {
    if (description && description.length > 1000) {
      throw new ProjectManagementError('Description cannot exceed 1000 characters');
    }
    return description?.trim() || '';
  },

  validateBudgetAmount: (amount: number): number => {
    if (amount < 0) {
      throw new ProjectManagementError('Budget amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new ProjectManagementError('Budget amount must be a valid number');
    }
    return amount;
  },

  validateQuantity: (quantity: number): number => {
    if (quantity < 0) {
      throw new ProjectManagementError('Quantity cannot be negative');
    }
    if (!Number.isInteger(quantity)) {
      throw new ProjectManagementError('Quantity must be a whole number');
    }
    return quantity;
  },

  sanitizeInput: (input: string): string => {
    // Basic XSS prevention - strip HTML tags and encode special characters
    return input
      .replace(/[<>"']/g, (char) => {
        // Character class without unnecessary escapes; ESLint no-useless-escape satisfied
        const map: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return map[char];
      })
      .trim();
  }
};
