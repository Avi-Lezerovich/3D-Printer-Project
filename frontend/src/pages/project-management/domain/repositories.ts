/**
 * Repository Interfaces - Clean Architecture
 * These define contracts for data access without specifying implementation details
 */

import { Task, TaskStatus, TaskPriority, BudgetCategory, BudgetExpense, InventoryItem, AnalyticsReport } from './models';

// Generic Repository Interface
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Task Repository
export interface TaskRepository extends Repository<Task> {
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  findByAssignee(assignee: string): Promise<Task[]>;
  findOverdue(): Promise<Task[]>;
  findByTags(tags: string[]): Promise<Task[]>;
  updateStatus(taskId: string, status: TaskStatus): Promise<Task | null>;
}

// Budget Repository
export interface BudgetRepository {
  getCategories(): Promise<BudgetCategory[]>;
  getCategoryById(id: string): Promise<BudgetCategory | null>;
  saveCategory(category: BudgetCategory): Promise<BudgetCategory>;
  deleteCategory(id: string): Promise<boolean>;
  
  getExpenses(categoryId?: string): Promise<BudgetExpense[]>;
  getExpenseById(id: string): Promise<BudgetExpense | null>;
  saveExpense(expense: BudgetExpense): Promise<BudgetExpense>;
  deleteExpense(id: string): Promise<boolean>;
  
  getExpensesByDateRange(start: Date, end: Date): Promise<BudgetExpense[]>;
  getTotalSpentByCategory(categoryId: string): Promise<number>;
}

// Inventory Repository
export interface InventoryRepository extends Repository<InventoryItem> {
  findLowStockItems(): Promise<InventoryItem[]>;
  findOutOfStockItems(): Promise<InventoryItem[]>;
  findBySupplier(supplier: string): Promise<InventoryItem[]>;
  updateQuantity(itemId: string, newQuantity: number): Promise<InventoryItem | null>;
  searchByName(name: string): Promise<InventoryItem[]>;
}

// Analytics Repository
export interface AnalyticsRepository extends Repository<AnalyticsReport> {
  findByDateRange(start: Date, end: Date): Promise<AnalyticsReport[]>;
  getTaskCompletionMetrics(period: { start: Date; end: Date }): Promise<Record<string, unknown>>;
  getBudgetUtilizationMetrics(period: { start: Date; end: Date }): Promise<Record<string, unknown>>;
  getInventoryTurnoverMetrics(period: { start: Date; end: Date }): Promise<Record<string, unknown>>;
  generateReport(reportType: string, period: { start: Date; end: Date }): Promise<AnalyticsReport>;
}
