/**
 * Shared types for Project Management features
 * Centralized type definitions to ensure consistency
 */

// Core domain types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  currency: string;
  description?: string;
  color?: string;
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
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  unit: string;
  unitCost?: number;
  currency?: string;
  supplier?: string;
  sku?: string;
  location?: string;
  status: InventoryStatus;
  tags: string[];
  lastRestockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';

// Analytics and metrics
export interface ProjectMetrics {
  tasks: TaskMetrics;
  budget: BudgetMetrics;
  inventory: InventoryMetrics;
  timeline: TimelineMetrics;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
  velocityTrend: 'up' | 'down' | 'stable';
  burndownData: BurndownPoint[];
}

export interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number;
  spendingTrend: 'up' | 'down' | 'stable';
  categoryBreakdown: CategorySpending[];
  monthlySpending: MonthlySpending[];
}

export interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  turnoverRate: number;
  restockAlerts: RestockAlert[];
}

export interface TimelineMetrics {
  projectStartDate: string;
  projectEndDate?: string;
  currentPhase: string;
  milestonesCompleted: number;
  totalMilestones: number;
  onSchedule: boolean;
  daysRemaining?: number;
}

// Supporting types for metrics
export interface BurndownPoint {
  date: string;
  planned: number;
  actual: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  percentage: number;
}

export interface MonthlySpending {
  month: string;
  planned: number;
  actual: number;
}

export interface RestockAlert {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  minimumQuantity: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  estimatedCost: number;
  supplier?: string;
}

// UI State types
export interface FilterState {
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ViewState {
  layout: 'list' | 'grid' | 'kanban' | 'timeline';
  density: 'compact' | 'comfortable' | 'spacious';
  groupBy?: string;
}

// Form types
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
  dependencies?: string[];
}

export interface BudgetCategoryFormData {
  name: string;
  budgetedAmount: number;
  currency: string;
  description?: string;
  color?: string;
}

export interface BudgetExpenseFormData {
  categoryId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receiptUrl?: string;
  vendor?: string;
  tags: string[];
}

export interface InventoryItemFormData {
  name: string;
  description: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  unit: string;
  unitCost?: number;
  currency?: string;
  supplier?: string;
  sku?: string;
  location?: string;
  tags: string[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationState;
  filters: FilterState;
  sort: SortState;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  // Use unknown instead of any for stronger typing
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Event types for real-time updates
export interface ProjectEvent<TData = unknown> {
  id: string;
  type: ProjectEventType;
  data: TData;
  timestamp: string;
  userId: string;
}

export type ProjectEventType = 
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.status_changed'
  | 'budget.expense_added'
  | 'budget.category_created'
  | 'inventory.quantity_updated'
  | 'inventory.item_added'
  | 'project.milestone_completed';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncOperationState extends LoadingState {
  lastUpdated?: string;
}

// Hook return types
export interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseBudgetResult {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  metrics: BudgetMetrics | null;
  loading: boolean;
  error: string | null;
  createCategory: (data: BudgetCategoryFormData) => Promise<BudgetCategory>;
  createExpense: (data: BudgetExpenseFormData) => Promise<BudgetExpense>;
  updateCategory: (id: string, data: Partial<BudgetCategoryFormData>) => Promise<BudgetCategory>;
  updateExpense: (id: string, data: Partial<BudgetExpenseFormData>) => Promise<BudgetExpense>;
  deleteCategory: (id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseInventoryResult {
  items: InventoryItem[];
  metrics: InventoryMetrics | null;
  alerts: RestockAlert[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  createItem: (data: InventoryItemFormData) => Promise<InventoryItem>;
  updateItem: (id: string, data: Partial<InventoryItemFormData>) => Promise<InventoryItem>;
  updateQuantity: (id: string, quantity: number) => Promise<InventoryItem>;
  deleteItem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
