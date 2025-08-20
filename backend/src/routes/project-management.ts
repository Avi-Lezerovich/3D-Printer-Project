import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { body, param, validationResult } from 'express-validator';
import { setCache } from '../middleware/cacheMiddleware.js';

// Task types aligned with frontend domain models
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'review' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimateHours?: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetExpense {
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

interface InventoryItem {
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

// In-memory storage (in production, this would be a database)
const tasks = new Map<string, Task>();
const budgetCategories = new Map<string, BudgetCategory>();
const budgetExpenses = new Map<string, BudgetExpense>();
const inventoryItems = new Map<string, InventoryItem>();

// Initialize with sample data
const initializeSampleData = () => {
  // Sample tasks
  const sampleTasks: Task[] = [
    {
      id: crypto.randomUUID(),
      title: 'Design 3D printer enclosure',
      description: 'Create a protective enclosure for the 3D printer with temperature control',
      status: 'in_progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimateHours: 12,
      labels: ['design', 'hardware', '3d-printing'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: 'Implement temperature monitoring',
      description: 'Add temperature sensors and monitoring dashboard',
      status: 'todo',
      priority: 'medium',
      labels: ['software', 'monitoring', 'sensors'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample budget categories
  const sampleCategories: BudgetCategory[] = [
    {
      id: crypto.randomUUID(),
      name: 'Hardware Components',
      budgetedAmount: 1500,
      currency: 'USD',
      description: '3D printer parts, sensors, and electronic components',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Materials',
      budgetedAmount: 500,
      currency: 'USD',
      description: 'Filaments, resins, and printing materials',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample inventory items
  const sampleInventory: InventoryItem[] = [
    {
      id: crypto.randomUUID(),
      name: 'PLA Filament - White',
      description: 'High-quality PLA filament for general printing',
      currentQuantity: 5,
      minimumQuantity: 2,
      unit: 'kg',
      unitCost: 25,
      currency: 'USD',
      supplier: 'PrintMart',
      sku: 'PLA-WHT-1KG',
      status: 'in-stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Nozzle 0.4mm',
      description: 'Standard brass nozzle for 3D printer',
      currentQuantity: 1,
      minimumQuantity: 3,
      unit: 'pieces',
      unitCost: 8,
      currency: 'USD',
      supplier: 'TechParts',
      sku: 'NOZZLE-04-BRASS',
      status: 'low-stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Populate maps
  sampleTasks.forEach(task => tasks.set(task.id, task));
  sampleCategories.forEach(category => budgetCategories.set(category.id, category));
  sampleInventory.forEach(item => inventoryItems.set(item.id, item));
};

// Initialize sample data
initializeSampleData();

const router = Router();

// Validation middleware
const validateTask = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['backlog','todo','in_progress','blocked','review','done','archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignee').optional().isString().trim().isLength({ max: 100 }),
  body('dueDate').optional().isISO8601(),
  body('estimateHours').optional().isFloat({ min: 0 }),
  body('labels').optional().isArray().custom((labels) => Array.isArray(labels) && labels.every((l: any) => typeof l === 'string' && l.length <= 50))
];

const validateBudgetCategory = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('budgetedAmount').isFloat({ min: 0 }),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('description').optional().isString().trim().isLength({ max: 500 })
];

const validateInventoryItem = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('description').isString().trim().isLength({ max: 500 }),
  body('currentQuantity').isFloat({ min: 0 }),
  body('minimumQuantity').isFloat({ min: 0 }),
  body('unit').isString().trim().isLength({ min: 1, max: 20 }),
  body('unitCost').optional().isFloat({ min: 0 }),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('supplier').optional().isString().trim().isLength({ max: 100 }),
  body('sku').optional().isString().trim().isLength({ max: 50 })
];

// TASKS ENDPOINTS
router.get('/tasks', setCache(5), (req, res) => {
  const { status, priority, assignee, label, search } = req.query as Record<string,string|undefined>
  let filtered = Array.from(tasks.values())
  if (status) filtered = filtered.filter(t => t.status === status)
  if (priority) filtered = filtered.filter(t => t.priority === priority)
  if (assignee) filtered = filtered.filter(t => t.assignee === assignee)
  if (label) filtered = filtered.filter(t => t.labels?.includes(label))
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }
  res.json({ tasks: filtered })
})

router.get('/tasks/:id', param('id').isUUID(), (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const task = tasks.get(req.params?.id || '');
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json({ task });
});

router.post('/tasks', validateTask, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description?.trim() || '',
    status: req.body.status || 'todo',
    priority: req.body.priority || 'medium',
    assignee: req.body.assignee?.trim(),
    dueDate: req.body.dueDate,
    estimateHours: req.body.estimateHours,
    labels: req.body.labels || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.set(task.id, task);
  try { req.app.get('io')?.emit?.('task.created', task) } catch {}
  res.status(201).json({ task });
});

router.put('/tasks/:id', param('id').isUUID(), validateTask, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const existingTask = tasks.get(req.params?.id || '');
  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const updatedTask: Task = {
    ...existingTask,
    title: req.body.title?.trim() || existingTask.title,
    description: req.body.description?.trim() || existingTask.description,
    status: req.body.status || existingTask.status,
    priority: req.body.priority || existingTask.priority,
    assignee: req.body.assignee?.trim() || existingTask.assignee,
    dueDate: req.body.dueDate || existingTask.dueDate,
    estimateHours: req.body.estimateHours ?? existingTask.estimateHours,
    labels: req.body.labels || existingTask.labels,
    updatedAt: new Date().toISOString()
  };

  tasks.set(req.params?.id || '', updatedTask);
  try { req.app.get('io')?.emit?.('task.updated', updatedTask) } catch {}
  res.json({ task: updatedTask });
});

router.delete('/tasks/:id', param('id').isUUID(), (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const deleted = tasks.delete(req.params?.id || '');
  if (!deleted) {
    return res.status(404).json({ message: 'Task not found' });
  }
  try { req.app.get('io')?.emit?.('task.deleted', req.params?.id) } catch {}
  res.status(204).send();
});

// BUDGET ENDPOINTS
router.get('/budget/categories', setCache(10), (req: Request, res: Response) => {
  res.json({ categories: Array.from(budgetCategories.values()) });
});

router.post('/budget/categories', validateBudgetCategory, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const category: BudgetCategory = {
    id: crypto.randomUUID(),
    name: req.body.name.trim(),
    budgetedAmount: req.body.budgetedAmount,
    currency: req.body.currency || 'USD',
    description: req.body.description?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  budgetCategories.set(category.id, category);
  res.status(201).json({ category });
});

router.get('/budget/expenses', setCache(5), (req: Request, res: Response) => {
  const { categoryId } = req.query;
  let filteredExpenses = Array.from(budgetExpenses.values());

  if (categoryId) {
    filteredExpenses = filteredExpenses.filter(expense => expense.categoryId === categoryId);
  }

  res.json({ expenses: filteredExpenses });
});

// INVENTORY ENDPOINTS
router.get('/inventory', setCache(10), (req: Request, res: Response) => {
  const { status, supplier } = req.query;
  let filteredItems = Array.from(inventoryItems.values());

  if (status) {
    filteredItems = filteredItems.filter(item => item.status === status);
  }
  if (supplier) {
    filteredItems = filteredItems.filter(item => item.supplier === supplier);
  }

  // Calculate status for each item
  filteredItems = filteredItems.map(item => ({
    ...item,
    status: item.currentQuantity === 0 ? 'out-of-stock' as const :
            item.currentQuantity <= item.minimumQuantity ? 'low-stock' as const :
            'in-stock' as const
  }));

  res.json({ items: filteredItems });
});

router.post('/inventory', validateInventoryItem, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const item: InventoryItem = {
    id: crypto.randomUUID(),
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    currentQuantity: req.body.currentQuantity,
    minimumQuantity: req.body.minimumQuantity,
    unit: req.body.unit.trim(),
    unitCost: req.body.unitCost,
    currency: req.body.currency || 'USD',
    supplier: req.body.supplier?.trim(),
    sku: req.body.sku?.trim(),
    status: req.body.currentQuantity === 0 ? 'out-of-stock' :
            req.body.currentQuantity <= req.body.minimumQuantity ? 'low-stock' :
            'in-stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inventoryItems.set(item.id, item);
  res.status(201).json({ item });
});

router.put('/inventory/:id/quantity', 
  param('id').isUUID(),
  body('quantity').isFloat({ min: 0 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = inventoryItems.get(req.params?.id || '');
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const updatedItem: InventoryItem = {
      ...item,
      currentQuantity: req.body.quantity,
      status: req.body.quantity === 0 ? 'out-of-stock' :
              req.body.quantity <= item.minimumQuantity ? 'low-stock' :
              'in-stock',
      updatedAt: new Date().toISOString()
    };

    inventoryItems.set(req.params?.id || '', updatedItem);
    res.json({ item: updatedItem });
  }
);

// ANALYTICS ENDPOINTS
router.get('/analytics/summary', setCache(30), (req: Request, res: Response) => {
  const totalTasks = tasks.size;
  const completedTasks = Array.from(tasks.values()).filter(task => task.status === 'done').length;
  const overdueTasks = Array.from(tasks.values()).filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date()
  ).length;

  const totalBudget = Array.from(budgetCategories.values()).reduce((sum, cat) => sum + cat.budgetedAmount, 0);
  const totalExpenses = Array.from(budgetExpenses.values()).reduce((sum, exp) => sum + exp.amount, 0);

  const lowStockItems = Array.from(inventoryItems.values()).filter(item => 
    item.currentQuantity <= item.minimumQuantity
  ).length;

  const outOfStockItems = Array.from(inventoryItems.values()).filter(item => 
    item.currentQuantity === 0
  ).length;

  res.json({
    summary: {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      budget: {
        total: totalBudget,
        spent: totalExpenses,
        remaining: totalBudget - totalExpenses,
        utilizationRate: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0
      },
      inventory: {
        total: inventoryItems.size,
        lowStock: lowStockItems,
        outOfStock: outOfStockItems
      }
    }
  });
});

export default router;
