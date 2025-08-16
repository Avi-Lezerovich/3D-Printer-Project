/**
 * Shared utility functions for Project Management features
 */

// Date utilities - using native Date API instead of date-fns to avoid external dependency
// TODO: Consider adding date-fns if more complex date operations are needed
import { 
  Task, 
  BudgetExpense, 
  InventoryItem, 
  TaskStatus, 
  TaskPriority, 
  InventoryStatus,
  FilterState,
  SortState 
} from './types';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  INVENTORY_STATUSES,
  DATE_FORMATS,
  CHART_COLORS 
} from './constants';

// Date utilities
export const formatDate = (date: string | Date, formatType: keyof typeof DATE_FORMATS = 'MEDIUM'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    // Simple formatting based on type
    switch (formatType) {
      case 'SHORT':
        return dateObj.toLocaleDateString('en-US');
      case 'MEDIUM':
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      case 'LONG':
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'ISO':
        return dateObj.toISOString().split('T')[0];
      case 'DATETIME':
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'short', day: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        });
      case 'TIME':
        return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      default:
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  } catch {
    return 'Invalid date';
  }
};

export const isOverdue = (dueDate: string | undefined): boolean => {
  if (!dueDate) return false;
  try {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return false;
    return due.getTime() < new Date().getTime();
  } catch {
    return false;
  }
};

export const getDaysUntilDue = (dueDate: string | undefined): number | null => {
  if (!dueDate) return null;
  try {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return null;
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

export const getWeekRange = (date: Date = new Date()) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday,
    end: sunday,
  };
};

// Status and priority utilities
export const getStatusConfig = (status: TaskStatus) => {
  return TASK_STATUSES.find(s => s.value === status) || TASK_STATUSES[0];
};

export const getPriorityConfig = (priority: TaskPriority) => {
  return TASK_PRIORITIES.find(p => p.value === priority) || TASK_PRIORITIES[0];
};

export const getInventoryStatusConfig = (status: InventoryStatus) => {
  return INVENTORY_STATUSES.find(s => s.value === status) || INVENTORY_STATUSES[0];
};

export const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
  const statusFlow: Record<TaskStatus, TaskStatus | null> = {
    'todo': 'in-progress',
    'in-progress': 'review',
    'review': 'done',
    'done': null,
  };
  return statusFlow[currentStatus];
};

export const canTransitionTo = (from: TaskStatus, to: TaskStatus): boolean => {
  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    'todo': ['in-progress', 'done'], // Can skip to done if simple task
    'in-progress': ['review', 'done', 'todo'], // Can go back to todo
    'review': ['done', 'in-progress'], // Can go back for changes
    'done': ['review'], // Can reopen for review
  };
  
  return allowedTransitions[from]?.includes(to) ?? false;
};

// Calculation utilities
export const calculateTaskProgress = (tasks: Task[]) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(task => task.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
};

export const calculateBudgetUtilization = (categories: { budgetedAmount: number }[], expenses: BudgetExpense[]) => {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  if (totalBudget === 0) return 0;
  return Math.round((totalSpent / totalBudget) * 100);
};

export const calculateInventoryValue = (items: InventoryItem[]) => {
  return items.reduce((total, item) => {
    const cost = item.unitCost || 0;
    return total + (cost * item.currentQuantity);
  }, 0);
};

export const getInventoryStatus = (item: InventoryItem): InventoryStatus => {
  if (item.currentQuantity <= 0) return 'out-of-stock';
  if (item.currentQuantity <= item.minimumQuantity) return 'low-stock';
  return 'in-stock';
};

// Filtering and sorting utilities
export const filterTasks = (tasks: Task[], filters: FilterState): Task[] => {
  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${task.title} ${task.description} ${task.assignee || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    // Status filter
    if (filters.status && task.status !== filters.status) return false;
    
    // Priority filter  
    if (filters.priority && task.priority !== filters.priority) return false;
    
    // Assignee filter
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => task.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Date range filter
    if (filters.dateRange && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      
      if (dueDate < start || dueDate > end) return false;
    }
    
    return true;
  });
};

export const sortTasks = (tasks: Task[], sort: SortState): Task[] => {
  const sorted = [...tasks].sort((a, b) => {
    let valueA = a[sort.field as keyof Task] as unknown;
    let valueB = b[sort.field as keyof Task] as unknown;
    
    // Handle special sorting cases
    if (sort.field === 'priority') {
      const priorityA = TASK_PRIORITIES.find(p => p.value === a.priority)?.weight || 0;
      const priorityB = TASK_PRIORITIES.find(p => p.value === b.priority)?.weight || 0;
      valueA = priorityA;
      valueB = priorityB;
    }
    
    // Handle dates
    if (sort.field === 'dueDate' || sort.field === 'createdAt' || sort.field === 'updatedAt') {
      const aDate = (typeof valueA === 'string' || typeof valueA === 'number' || valueA instanceof Date) ? new Date(valueA).getTime() : 0;
      const bDate = (typeof valueB === 'string' || typeof valueB === 'number' || valueB instanceof Date) ? new Date(valueB).getTime() : 0;
      valueA = aDate;
      valueB = bDate;
    }
    
    // Handle strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    // Compare values
  if ((valueA as number | string) < (valueB as number | string)) return sort.direction === 'asc' ? -1 : 1;
  if ((valueA as number | string) > (valueB as number | string)) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

// Validation utilities
export const validateTaskTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.trim().length > 100) {
    return 'Title must be less than 100 characters';
  }
  return null;
};

export const validateBudgetAmount = (amount: number | string): string | null => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Amount must be a valid number';
  }
  if (numAmount <= 0) {
    return 'Amount must be greater than 0';
  }
  if (numAmount > 1000000) {
    return 'Amount is too large';
  }
  return null;
};

export const validateInventoryQuantity = (quantity: number | string): string | null => {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  
  if (isNaN(numQuantity)) {
    return 'Quantity must be a valid number';
  }
  if (numQuantity < 0) {
    return 'Quantity cannot be negative';
  }
  if (numQuantity > 999999) {
    return 'Quantity is too large';
  }
  return null;
};

// Formatting utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Color utilities for charts and status indicators
export const getStatusColorClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    'todo': 'bg-gray-100 text-gray-800 border-gray-300',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'review': 'bg-purple-100 text-purple-800 border-purple-300',
    'done': 'bg-green-100 text-green-800 border-green-300',
    'low': 'bg-green-100 text-green-800 border-green-300',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'high': 'bg-orange-100 text-orange-800 border-orange-300',
    'urgent': 'bg-red-100 text-red-800 border-red-300',
    'in-stock': 'bg-green-100 text-green-800 border-green-300',
    'low-stock': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'out-of-stock': 'bg-red-100 text-red-800 border-red-300',
    'discontinued': 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getChartColor = (index: number): string => {
  const colors = [
    CHART_COLORS.PRIMARY,
    CHART_COLORS.SUCCESS,
    CHART_COLORS.WARNING,
    CHART_COLORS.DANGER,
    CHART_COLORS.INFO,
    CHART_COLORS.MUTED,
  ];
  
  return colors[index % colors.length];
};

// URL and navigation utilities
export const updateUrlParams = (params: Record<string, string | undefined>) => {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  window.history.replaceState({}, '', url.toString());
};

export const getUrlParam = (key: string): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};

// Local storage utilities with error handling
export const setStorageItem = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Deep merge utility for combining objects
export const deepMerge = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
  const result: T = { ...target };
  Object.keys(source).forEach((key) => {
    const k = key as keyof T;
    const sourceValue = source[k];
    const targetValue = result[k];
    if (
      sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
      targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
    ) {
  result[k] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>) as T[typeof k];
    } else if (sourceValue !== undefined) {
      result[k] = sourceValue as T[typeof k];
    }
  });
  return result;
};
