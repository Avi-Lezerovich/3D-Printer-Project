/**
 * Domain Models for Project Management
 * Following Clean Architecture and Domain-Driven Design principles
 * These models represent the core business entities and should be framework-agnostic
 */

// Base Entity with common properties
export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

// Value Objects
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

// Task Domain Model
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

export class Task extends BaseEntity {
  constructor(
    id: string,
    public title: string,
    public description: string,
    public status: TaskStatus = TaskStatus.TODO,
    public priority: TaskPriority = TaskPriority.MEDIUM,
    public assignee?: string,
    public dueDate?: Date,
    public estimatedHours?: number,
    public tags: string[] = [],
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.validateTitle(title);
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters');
    }
  }

  updateStatus(status: TaskStatus): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      status,
      this.priority,
      this.assignee,
      this.dueDate,
      this.estimatedHours,
      this.tags,
      this.createdAt,
      new Date()
    );
  }

  isOverdue(): boolean {
    return this.dueDate ? new Date() > this.dueDate : false;
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    const transitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.REVIEW, TaskStatus.DONE],
      [TaskStatus.REVIEW]: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
      [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS]
    };

    return transitions[this.status].includes(newStatus);
  }
}

// Budget Domain Model
export class BudgetCategory extends BaseEntity {
  constructor(
    id: string,
    public name: string,
    public budgetedAmount: Money,
    public description?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }
}

export class BudgetExpense extends BaseEntity {
  constructor(
    id: string,
    public categoryId: string,
    public description: string,
    public amount: Money,
    public date: Date,
    public receiptUrl?: string,
    public vendor?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }
}

// Inventory Domain Model
export enum InventoryStatus {
  IN_STOCK = 'in-stock',
  LOW_STOCK = 'low-stock',
  OUT_OF_STOCK = 'out-of-stock',
  DISCONTINUED = 'discontinued'
}

export class InventoryItem extends BaseEntity {
  constructor(
    id: string,
    public name: string,
    public description: string,
    public currentQuantity: number,
    public minimumQuantity: number,
    public unit: string,
    public unitCost?: Money,
    public supplier?: string,
    public sku?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.validateQuantities();
  }

  private validateQuantities(): void {
    if (this.currentQuantity < 0) {
      throw new Error('Current quantity cannot be negative');
    }
    if (this.minimumQuantity < 0) {
      throw new Error('Minimum quantity cannot be negative');
    }
  }

  getStatus(): InventoryStatus {
    if (this.currentQuantity === 0) return InventoryStatus.OUT_OF_STOCK;
    if (this.currentQuantity <= this.minimumQuantity) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.IN_STOCK;
  }

  updateQuantity(newQuantity: number): InventoryItem {
    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    return new InventoryItem(
      this.id,
      this.name,
      this.description,
      newQuantity,
      this.minimumQuantity,
      this.unit,
      this.unitCost,
      this.supplier,
      this.sku,
      this.createdAt,
      new Date()
    );
  }

  needsReorder(): boolean {
    return this.currentQuantity <= this.minimumQuantity;
  }
}

// Analytics Domain Models
export interface ProjectMetric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
  description: string;
  category: 'performance' | 'quality' | 'cost' | 'time';
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export class AnalyticsReport extends BaseEntity {
  constructor(
    id: string,
    public title: string,
    public metrics: ProjectMetric[],
    public chartData: ChartDataPoint[],
    public period: { start: Date; end: Date },
    public generatedBy: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  getMetricsByCategory(category: ProjectMetric['category']): ProjectMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  getTotalValue(category?: ProjectMetric['category']): number {
    const relevantMetrics = category 
      ? this.getMetricsByCategory(category)
      : this.metrics;
    
    return relevantMetrics.reduce((sum, metric) => sum + metric.value, 0);
  }
}
