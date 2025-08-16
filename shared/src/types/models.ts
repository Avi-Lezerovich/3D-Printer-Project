// Domain models shared across frontend & backend (keep persistence details out)

export interface ProjectModel {
  id: string
  name: string
  status: string
  createdAt: string // ISO8601
}

export interface UserModel {
  email: string
  role: string
  createdAt: string
}

export interface TaskModel {
  id: string
  title: string
  status: string
  priority: string
  projectId?: string | null
  assignee?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItemModel {
  id: string
  name: string
  currentQuantity: number
  minimumQuantity: number
  unit: string
  status: string
  updatedAt: string
}
