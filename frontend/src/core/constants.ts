export const APP_VERSION = '0.1.0';
export const STATE_SCHEMA_VERSION = 1;

export const ROUTES = {
  ROOT: '/',
  CONTROL_PANEL: '/control',
  SETTINGS: '/settings',
  HELP: '/help',
  LOGIN: '/login'
} as const;

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export const ACCESSIBILITY = {
  FOCUS_GUARD_ATTR: 'data-focus-guard'
};

export const SECURITY = {
  REQUEST_TIMEOUT_MS: 12000
};
