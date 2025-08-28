# Architecture and Best Practices Guide

This document outlines the architectural decisions, coding standards, and best practices for the 3D Printer Control System focusing on simplicity, maintainability, and core functionality.

## 🏗️ Architecture Overview

### System Architecture

The application follows a **monorepo architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React SPA)   │───▶│  (Node.js API)  │───▶│  (PostgreSQL)   │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌─────────────────┐              
         │              │     Redis       │              
         │              │   (Cache)       │              
         │              │   Port: 6379    │              
         │              └─────────────────┘              
         │                                                
         ▼                                                
┌─────────────────────────────────────────────────────────┐
│                WebSocket (Real-time)                    │
└─────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
2. **Type Safety**: Comprehensive TypeScript usage across all layers
3. **Feature-Based Organization**: Group related functionality together
4. **API-First Design**: Backend provides well-documented REST API
5. **Progressive Enhancement**: Core functionality works without JavaScript
6. **Performance by Design**: Optimized for speed and scalability

## 🎯 Frontend Architecture

### Directory Structure

```
frontend/src/
├── components/           # Shared UI components
│   ├── ui/              # Basic UI primitives (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── common/          # Complex shared components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   ├── project-management/ # Project management feature
│   └── portfolio/       # Portfolio feature
├── pages/               # Route components
├── services/            # API clients and external services
├── hooks/               # Custom React hooks
├── types/               # Frontend-specific types
├── utils/               # Utility functions
└── styles/              # Global styles and themes
```

### Component Design Principles

#### 1. Single Responsibility Principle
Each component should have one clear purpose:

```typescript
// ✅ Good: Focused component
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  return (
    <div className="project-card">
      <ProjectHeader project={project} />
      <ProjectContent project={project} />
      <ProjectActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

// ❌ Bad: Component doing too much
const ControlPanel: React.FC = () => {
  // Handles printer status, file upload, queue management, temperature control, etc.
  // This component is too complex
};
```

#### 2. Props Interface Design
Use clear, typed interfaces for props:

```typescript
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  className?: string;
  isSelected?: boolean;
}

// Use descriptive prop names
const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  className,
  isSelected = false 
}) => {
  // Component implementation
};
```

#### 3. State Management Strategy

- **Local State**: Use `useState` for component-specific state
- **Shared State**: Use Zustand for lightweight global state
- **Server State**: Use React Query for API data management

```typescript
// Local state example
const [isEditing, setIsEditing] = useState(false);

// Global state example (Zustand)
const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: {},
  setTasks: (tasks) => set({ tasks }),
  setFilters: (filters) => set({ filters }),
}));

// Server state example (React Query)
const useTasksQuery = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getTasks(),
  });
};
```

### Design System Implementation

#### 1. Design Tokens
Centralized design tokens for consistency:

```typescript
export const designTokens = {
  colors: {
    primary: { 500: '#0ea5e9', 600: '#0284c7' },
    success: { 500: '#22c55e', 600: '#16a34a' },
    danger: { 500: '#ef4444', 600: '#dc2626' },
  },
  spacing: {
    xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem'
  },
  typography: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    fontSize: { sm: '0.875rem', base: '1rem', lg: '1.125rem' }
  }
};
```

#### 2. Component Variants
Consistent component API patterns:

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick 
}) => {
  const baseClasses = 'btn btn-base';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
};
```

## 🔧 Backend Architecture

### Directory Structure

```
backend/src/
├── routes/              # API route handlers
├── middleware/          # Express middleware
├── services/            # Business logic layer
├── repositories/        # Data access layer
├── utils/               # Utility functions
├── config/              # Configuration management
├── types/               # Backend-specific types
└── __tests__/           # Test files
```

### Layered Architecture

#### 1. Route Layer (Controllers)
Handle HTTP requests and responses:

```typescript
// routes/tasks.ts
router.get('/tasks', 
  authenticateJWT,
  validateQuery(GetTasksQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20 } = req.validatedQuery;
      const tasks = await taskService.getTasks({ page, limit });
      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  }
);
```

#### 2. Service Layer (Business Logic)
Implement business rules and orchestrate operations:

```typescript
// services/taskService.ts
export class TaskService {
  constructor(private taskRepository: TaskRepository) {}
  
  async getTasks(options: GetTasksOptions): Promise<Task[]> {
    // Business logic here
    const tasks = await this.taskRepository.findTasks(options);
    return tasks.map(this.enrichTaskData);
  }
  
  private enrichTaskData(task: Task): Task {
    // Add computed fields, format data, etc.
    return {
      ...task,
      isOverdue: new Date(task.dueDate) < new Date(),
      daysUntilDue: this.calculateDaysUntilDue(task.dueDate)
    };
  }
}
```

#### 3. Repository Layer (Data Access)
Abstract database operations:

```typescript
// repositories/taskRepository.ts
export class TaskRepository {
  async findTasks(options: FindTasksOptions): Promise<Task[]> {
    // Database query logic
    const query = this.buildQuery(options);
    return await this.db.query(query);
  }
  
  async createTask(data: CreateTaskData): Promise<Task> {
    const task = await this.db.task.create({ data });
    return task;
  }
}
```

### Error Handling Strategy

#### 1. Consistent Error Format
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
}

class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

#### 2. Global Error Handler
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: ApiError = {
    code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
    message: err.message || 'Internal Server Error',
    details: err instanceof AppError ? err.details : undefined,
    timestamp: new Date().toISOString(),
    path: req.path
  };
  
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({ error });
};
```

### Input Validation

Use Zod schemas for consistent validation:

```typescript
// schemas/taskSchemas.ts
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// middleware/validate.ts
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest('Validation failed', result.error.issues));
    }
    (req as any).validatedBody = result.data;
    next();
  };
}
```

## 📏 Coding Standards

### TypeScript Guidelines

#### 1. Type Definitions
```typescript
// Use explicit types for function parameters and return values
function calculateTaskProgress(tasks: Task[]): ProgressData {
  // Implementation
}

// Use interfaces for object shapes
interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
}

// Use enums for fixed sets of values
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Use union types for limited string values
type TaskStatus = 'todo' | 'in-progress' | 'done';
```

#### 2. Generic Types
```typescript
// Generic API response type
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Generic repository pattern
interface Repository<T, CreateData, UpdateData> {
  findById(id: string): Promise<T | null>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Code Formatting

#### 1. ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### 2. Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80
}
```

### Naming Conventions

#### 1. Files and Directories

**Components**: PascalCase with descriptive names
```typescript
// ✅ Good
TaskCard.tsx           // Specific component purpose
UserProfileModal.tsx   // Clear what it does
ProjectAnalytics.tsx   // Domain + function

// ❌ Avoid
card.tsx              // Too generic
Modal.tsx             // Not descriptive enough
component1.tsx        // No semantic meaning
```

**Hooks**: camelCase starting with 'use'
```typescript
// ✅ Good
useTaskStore.ts        // Clear data it manages
useAuthToken.ts        // Specific auth functionality
useProjectAnalytics.ts // Domain + purpose

// ❌ Avoid
useData.ts            // Too generic
taskHook.ts           // Wrong naming pattern
useStuff.ts           // Not descriptive
```

**Utilities**: camelCase with action verbs
```typescript
// ✅ Good
formatDate.ts         // Clear function
validateEmail.ts      // Specific validation
calculateProgress.ts  // Action + subject

// ❌ Avoid
helpers.ts           // Too broad
utils.ts             // Generic
stuff.ts             // Meaningless
```

**Constants**: UPPER_SNAKE_CASE with context
```typescript
// ✅ Good
API_ENDPOINTS.ts      // Clear purpose
ERROR_MESSAGES.ts     // Specific constants
TASK_STATUSES.ts      // Domain-specific

// ❌ Avoid
constants.ts         // Too generic
CONST.ts            // Abbreviation
data.ts             // Not descriptive
```

#### 2. Variables and Functions

```typescript
// ✅ Variables: camelCase, descriptive nouns
const userTasks = [];
const isAuthenticated = false;
const taskCompletionRate = 0.85;
const primaryButtonColor = '#0ea5e9';

// ❌ Avoid
const data = []; // Too generic
const flag = false; // Not descriptive
const temp = 0.85; // Temporary naming
const color1 = '#0ea5e9'; // Numbered variables

// ✅ Functions: camelCase, descriptive verbs
const calculateTaskProgress = (tasks: Task[]) => { ... };
const formatTaskDate = (date: Date) => { ... };
const handleTaskCreate = (taskData: TaskData) => { ... };
const validateUserInput = (input: string) => { ... };

// ❌ Avoid
const calc = (tasks) => { ... }; // Abbreviated
const doStuff = () => { ... }; // Not descriptive
const handler1 = () => { ... }; // Numbered
const process = () => { ... }; // Too generic

// ✅ Constants: UPPER_SNAKE_CASE with context
const MAX_TASKS_PER_PAGE = 20;
const DEFAULT_SORT_ORDER = 'createdAt';
const API_BASE_URL = process.env.VITE_API_BASE;
const TASK_PRIORITY_HIGH = 'high';

// ✅ Types/Interfaces: PascalCase, descriptive
interface TaskData {
  id: string;
  title: string;
  status: TaskStatus;
}

type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

// Custom type guards
type UserRole = 'admin' | 'user' | 'viewer';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

#### 3. Component Props and State

```typescript
// ✅ Props: Clear interface names
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  className?: string;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ✅ State: Descriptive variable names
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [formErrors, setFormErrors] = useState<Record<string, string>>({});
```

#### 4. API Routes and Database

```typescript
// ✅ API Routes: RESTful, resource-based
GET    /api/v1/tasks              // Get all tasks
GET    /api/v1/tasks/:id          // Get specific task
POST   /api/v1/tasks              // Create new task
PUT    /api/v1/tasks/:id          // Update task
DELETE /api/v1/tasks/:id          // Delete task

GET    /api/v1/projects/:id/tasks // Nested resource
POST   /api/v1/auth/login         // Action-based for auth
POST   /api/v1/auth/refresh       // Token operations

// ✅ Database: snake_case for SQL, camelCase for documents
// SQL Tables
users
projects  
tasks
budget_categories
inventory_items

// Document fields
{
  userId: "abc123",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  isActive: true
}
```

## 🎯 Performance Best Practices

### Frontend Performance

#### 1. Code Splitting
```typescript
// Route-level code splitting
const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const Portfolio = lazy(() => import('../pages/Portfolio'));

// Component-level code splitting
const HeavyChart = lazy(() => import('../components/HeavyChart'));
```

#### 2. Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexData(tasks);
}, [tasks]);

// Memoize callbacks to prevent unnecessary re-renders
const handleTaskUpdate = useCallback((task: Task) => {
  updateTask(task);
}, [updateTask]);

// Memoize components
const TaskCard = memo<TaskCardProps>(({ task, onEdit, onDelete }) => {
  return (
    <div className="task-card">
      {/* Component content */}
    </div>
  );
});
```

#### 3. Virtualization for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

const TaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const ItemRenderer = ({ index, style }: any) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={tasks.length}
      itemSize={100}
    >
      {ItemRenderer}
    </List>
  );
};
```

### Backend Performance

#### 1. Caching Strategy
```typescript
// Redis caching
class TaskService {
  async getTasks(options: GetTasksOptions): Promise<Task[]> {
    const cacheKey = `tasks:${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Fetch from database
    const tasks = await this.taskRepository.findTasks(options);
    
    // Cache result
    await this.cache.setex(cacheKey, 300, JSON.stringify(tasks)); // 5 minutes
    
    return tasks;
  }
}
```

#### 2. Database Optimization
```typescript
// Use database indexes
// Add to migration:
CREATE INDEX idx_tasks_status_created_at ON tasks(status, created_at);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);

// Optimize queries - select only needed fields
const tasks = await db.task.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    createdAt: true,
  },
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

#### 3. Rate Limiting
```typescript
// Apply rate limiting to protect APIs
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', rateLimiter);
```

## 🧪 Testing Best Practices

### Frontend Testing

#### 1. Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo' as const,
    priority: 'medium' as const,
  };

  it('displays task title', () => {
    render(<TaskCard task={mockTask} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={jest.fn()} />);
    
    fireEvent.click(screen.getByLabelText('Edit task'));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

#### 2. Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useTaskStore } from '../useTaskStore';

describe('useTaskStore', () => {
  it('should add task', () => {
    const { result } = renderHook(() => useTaskStore());
    
    act(() => {
      result.current.addTask(mockTask);
    });
    
    expect(result.current.tasks).toContain(mockTask);
  });
});
```

### Backend Testing

#### 1. API Testing
```typescript
import request from 'supertest';
import { app } from '../app';

describe('POST /api/v1/tasks', () => {
  it('should create task', async () => {
    const taskData = {
      title: 'New Task',
      priority: 'medium',
    };

    const response = await request(app)
      .post('/api/v1/tasks')
      .send(taskData)
      .expect(201);

    expect(response.body.task.title).toBe('New Task');
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({})
      .expect(400);

    expect(response.body.error.details).toContain('title is required');
  });
});
```

#### 2. Service Testing
```typescript
describe('TaskService', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockRepository = {
      findTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    } as any;
    
    taskService = new TaskService(mockRepository);
  });

  it('should get tasks with enriched data', async () => {
    mockRepository.findTasks.mockResolvedValue([mockTask]);
    
    const tasks = await taskService.getTasks({});
    
    expect(tasks[0]).toHaveProperty('isOverdue');
    expect(tasks[0]).toHaveProperty('daysUntilDue');
  });
});
```

## 🔒 Security Best Practices

### 1. Authentication & Authorization
```typescript
// JWT token validation
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 2. Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};

// Validate and sanitize input
const validateTaskInput = (data: any) => {
  return {
    title: validator.escape(data.title),
    description: sanitizeHtml(data.description || ''),
    priority: validator.isIn(data.priority, ['low', 'medium', 'high']) ? data.priority : 'medium'
  };
};
```

### 3. CORS Configuration
```typescript
const corsOptions = {
  origin: (origin: string, callback: Function) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## 📊 Monitoring and Logging

### 1. Structured Logging
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    time: () => ({ timestamp: new Date().toISOString() }),
  },
});

// Usage
logger.info({ taskId: '123', action: 'create' }, 'Task created successfully');
logger.error({ error: err.message, stack: err.stack }, 'Task creation failed');
```

### 2. Metrics Collection
```typescript
// Custom metrics
const taskMetrics = {
  tasksCreated: new Counter({ name: 'tasks_created_total', help: 'Total tasks created' }),
  taskDuration: new Histogram({ name: 'task_duration_seconds', help: 'Task completion time' }),
};

// Usage in service
const createTask = async (data: CreateTaskData) => {
  const start = Date.now();
  try {
    const task = await this.repository.create(data);
    taskMetrics.tasksCreated.inc();
    return task;
  } finally {
    taskMetrics.taskDuration.observe((Date.now() - start) / 1000);
  }
};
```

This architecture and best practices guide ensures the 3D Printer Project maintains high code quality, performance, and maintainability standards while providing clear guidelines for development teams.