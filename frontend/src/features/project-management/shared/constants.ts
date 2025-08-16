/**
 * Shared constants for Project Management features
 */

import { TaskStatus, TaskPriority, InventoryStatus } from './types';

// Task-related constants
export const TASK_STATUSES: { value: TaskStatus; label: string; color: string; icon: string }[] = [
  { value: 'todo', label: 'To Do', color: 'gray', icon: '📝' },
  { value: 'in-progress', label: 'In Progress', color: 'blue', icon: '⚡' },
  { value: 'review', label: 'In Review', color: 'purple', icon: '👀' },
  { value: 'done', label: 'Completed', color: 'green', icon: '✅' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string; icon: string; weight: number }[] = [
  { value: 'low', label: 'Low Priority', color: 'green', icon: '🟢', weight: 1 },
  { value: 'medium', label: 'Medium Priority', color: 'yellow', icon: '🟡', weight: 2 },
  { value: 'high', label: 'High Priority', color: 'orange', icon: '🟠', weight: 3 },
  { value: 'urgent', label: 'Urgent', color: 'red', icon: '🔴', weight: 4 },
];

// Inventory-related constants
export const INVENTORY_STATUSES: { value: InventoryStatus; label: string; color: string; icon: string }[] = [
  { value: 'in-stock', label: 'In Stock', color: 'green', icon: '📦' },
  { value: 'low-stock', label: 'Low Stock', color: 'yellow', icon: '📋' },
  { value: 'out-of-stock', label: 'Out of Stock', color: 'red', icon: '❌' },
  { value: 'discontinued', label: 'Discontinued', color: 'gray', icon: '⛔' },
];

// Common measurement units
export const MEASUREMENT_UNITS = [
  { value: 'piece', label: 'Piece (pcs)' },
  { value: 'kilogram', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (g)' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'milliliter', label: 'Milliliter (mL)' },
  { value: 'meter', label: 'Meter (m)' },
  { value: 'centimeter', label: 'Centimeter (cm)' },
  { value: 'millimeter', label: 'Millimeter (mm)' },
  { value: 'square_meter', label: 'Square Meter (m²)' },
  { value: 'cubic_meter', label: 'Cubic Meter (m³)' },
  { value: 'roll', label: 'Roll' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'box', label: 'Box' },
  { value: 'set', label: 'Set' },
] as const;

// Currency codes
export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
] as const;

// Date format constants
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  TASKS: '/api/v1/project-management/tasks',
  BUDGET_CATEGORIES: '/api/v1/project-management/budget/categories',
  BUDGET_EXPENSES: '/api/v1/project-management/budget/expenses',
  INVENTORY: '/api/v1/project-management/inventory',
  ANALYTICS: '/api/v1/project-management/analytics',
  METRICS: '/api/v1/project-management/metrics',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TASK_FILTERS: 'pm_task_filters',
  INVENTORY_FILTERS: 'pm_inventory_filters',
  VIEW_PREFERENCES: 'pm_view_preferences',
  ACTIVE_TAB: 'pm_active_tab',
  THEME: 'pm_theme',
  SIDEBAR_STATE: 'pm_sidebar_state',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  TASK_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  TASK_DESCRIPTION: {
    MAX_LENGTH: 1000,
  },
  BUDGET_CATEGORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  BUDGET_AMOUNT: {
    MIN: 0.01,
    MAX: 1000000,
  },
  INVENTORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  INVENTORY_QUANTITY: {
    MIN: 0,
    MAX: 999999,
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500,
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TOTAL_PAGES_THRESHOLD: 10,
} as const;

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 150,
  SAVE: 1000,
  RESIZE: 100,
} as const;

// Chart colors for analytics
export const CHART_COLORS = {
  PRIMARY: '#0ea5e9',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  MUTED: '#6b7280',
  GRADIENT: {
    PRIMARY: ['#0ea5e9', '#0284c7'],
    SUCCESS: ['#22c55e', '#16a34a'],
    WARNING: ['#f59e0b', '#d97706'],
    DANGER: ['#ef4444', '#dc2626'],
  },
} as const;

// Feature flags for progressive enhancement
export const FEATURE_FLAGS = {
  REAL_TIME_UPDATES: true,
  ADVANCED_ANALYTICS: true,
  KANBAN_VIEW: true,
  TIMELINE_VIEW: true,
  BULK_OPERATIONS: true,
  EXPORT_FUNCTIONALITY: true,
  NOTIFICATIONS: true,
  DARK_MODE: true,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  CATEGORY_CREATED: 'Budget category created successfully!',
  EXPENSE_ADDED: 'Expense added successfully!',
  INVENTORY_UPDATED: 'Inventory updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

// Theme configurations
export const THEME_CONFIG = {
  LIGHT: {
    name: 'light',
    label: 'Light Mode',
    icon: '☀️',
  },
  DARK: {
    name: 'dark',
    label: 'Dark Mode',
    icon: '🌙',
  },
  SYSTEM: {
    name: 'system',
    label: 'System Default',
    icon: '💻',
  },
} as const;

// Export grouped constants for easier importing
export const CONSTANTS = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  INVENTORY_STATUSES,
  MEASUREMENT_UNITS,
  CURRENCIES,
  DATE_FORMATS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  VALIDATION_RULES,
  ANIMATION_DURATIONS,
  PAGINATION_DEFAULTS,
  DEBOUNCE_DELAYS,
  CHART_COLORS,
  FEATURE_FLAGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_CONFIG,
} as const;
