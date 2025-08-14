// Repository interface definitions for persistence abstraction

export interface UserRecord {
  email: string
  passwordHash: string
  role: string
  createdAt: Date
}

export interface ProjectRecord {
  id: string
  name: string
  status: string
  createdAt: Date
}

export interface TaskRecord {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  assignee?: string | null
  dueDate?: Date | null
  estimatedHours?: number | null
  tags?: string | null
  projectId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItemRecord {
  id: string
  name: string
  description?: string | null
  currentQuantity: number
  minimumQuantity: number
  unit: string
  unitCost?: number | null
  currency?: string | null
  supplier?: string | null
  sku?: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface BudgetCategoryRecord {
  id: string
  name: string
  budgetedAmount: number
  currency: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BudgetExpenseRecord {
  id: string
  categoryId: string
  description: string
  amount: number
  currency: string
  date: Date
  vendor?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>
  create(data: Pick<UserRecord, 'email' | 'passwordHash' | 'role'>): Promise<UserRecord>
}

export interface ProjectRepository {
  list(): Promise<ProjectRecord[]>
  get(id: string): Promise<ProjectRecord | null>
  create(data: Pick<ProjectRecord, 'name' | 'status'>): Promise<ProjectRecord>
  update(id: string, data: Partial<Pick<ProjectRecord, 'name' | 'status'>>): Promise<ProjectRecord | null>
  remove(id: string): Promise<boolean>
}

// Additional repositories (Task, Inventory, Budget) can be added later as routes refactored

export interface Repositories {
  users: UserRepository
  projects: ProjectRepository
}
