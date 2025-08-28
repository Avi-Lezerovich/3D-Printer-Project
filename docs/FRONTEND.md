# Frontend Development Guide

This guide provides information for developing and maintaining the streamlined frontend application of the 3D Printer Control System.

## 🎯 Frontend Overview

The frontend is a clean, focused React Single Page Application (SPA) with 4 core pages, built with:

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Zustand**: Lightweight client state management
- **Framer Motion**: Animation library

## 📁 Project Structure

```
frontend/src/
├── components/           # Shared UI components
│   ├── ui/              # Basic UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   └── common/          # Complex shared components
│       ├── ProjectCard.tsx
│       ├── ControlPanel.tsx
│       └── ...
├── features/            # Feature-based modules
│   ├── auth/            # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── portfolio/       # Portfolio features
├── pages/               # Route components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── ControlPanel.tsx
│   ├── Settings.tsx
│   ├── Help.tsx
│   └── ...
├── services/            # API clients and utilities
│   ├── api/
│   ├── socket/
│   └── storage/
├── hooks/               # Custom React hooks
│   ├── useApi.ts
│   ├── useSocket.ts
│   └── useLocalStorage.ts
├── types/               # TypeScript type definitions
│   ├── api.ts
│   ├── components.ts
│   └── global.ts
├── utils/               # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
├── styles/              # Global styles and themes
│   ├── globals.css
│   ├── components.css
│   └── variables.css
└── __tests__/           # Test files
    ├── components/
    ├── hooks/
    └── utils/
```

## 🎨 Design System

### Design Tokens

The project uses a comprehensive design system with centralized tokens:

```typescript
// src/design-system/tokens.ts
export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      600: '#0284c7',
      900: '#0c4a6e',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    danger: {
      500: '#ef4444',
      600: '#dc2626',
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.125rem', '1.75rem'],
      xl: ['1.25rem', '1.75rem'],
    }
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem',
    16: '4rem',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  // Animations
  transitions: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
    },
    easing: {
      out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      in: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      inOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    }
  }
};
```

### Component Library

#### Button Component

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classNames';

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    icon,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
    ].join(' ');

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading ? (
          <motion.div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

#### Input Component

```typescript
// src/components/ui/Input.tsx
import React from 'react';
import { cn } from '../../utils/classNames';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helper, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

## 🔄 State Management

### Global State (Zustand)

Use Zustand for lightweight global state that doesn't come from the server:

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface UiActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
  devtools(
    (set, get) => ({
      // State
      sidebarOpen: false,
      theme: 'light',
      notifications: [],

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => 
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() }
          ]
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),
    }),
    { name: 'ui-store' }
  )
);
```

### Server State (React Query)

Use React Query for all server-side data:

```typescript
// src/services/api/projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Project, CreateProjectData, UpdateProjectData } from '../../types/api';

const PROJECTS_KEY = 'projects';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: [PROJECTS_KEY],
    queryFn: () => apiClient.get<{ projects: Project[] }>('/projects'),
    select: (data) => data.projects,
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProjectData) =>
      apiClient.post<{ project: Project }>('/projects', data),
    onSuccess: (response) => {
      // Optimistically update the cache
      queryClient.setQueryData([PROJECTS_KEY], (old: Project[] = []) => [
        ...old,
        response.project,
      ]);
    },
  });
};
```

## 🎣 Custom Hooks

### API Hooks

```typescript
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiClient } from '../services/api/client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, execute };
}
```

### Form Hooks

```typescript
// src/hooks/useForm.ts
import { useState, useCallback, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const newErrors = validate ? validate({ ...values, [name]: value }) : {};
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
    }
  }, [values, touched, validate]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setValue(name, newValue);
  }, [setValue]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const newErrors = validate ? validate(values) : {};
    setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setTouched(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    const newErrors = validate ? validate(values) : {};
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
```

## 🧪 Testing

### Component Testing

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

### Hook Testing

```typescript
// src/hooks/__tests__/useForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

interface FormData {
  email: string;
  password: string;
}

describe('useForm', () => {
  const initialValues: FormData = {
    email: '',
    password: '',
  };

  const validate = (values: FormData) => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    return errors;
  };

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validate,
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('validates on submit', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage

1. **Use Tailwind utilities for styling**:
   ```tsx
   <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
     <h2 className="text-lg font-semibold text-gray-900">Project Title</h2>
     <Button variant="primary" size="sm">Edit</Button>
   </div>
   ```

2. **Create custom CSS classes for complex patterns**:
   ```css
   /* styles/components.css */
   .project-card {
     @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4;
     @apply hover:shadow-md transition-shadow duration-150;
   }
   
   .project-card--completed {
     @apply opacity-75 bg-gray-50;
   }
   ```

3. **Use CSS custom properties for dynamic values**:
   ```css
   .progress-bar {
     @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
     width: var(--progress-width);
   }
   ```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 md:p-6 lg:p-8">
    <h3 className="text-lg md:text-xl lg:text-2xl font-bold">
      Responsive Title
    </h3>
  </div>
</div>
```

## 🚀 Performance Optimization

### Code Splitting

Use React.lazy for route-level code splitting:

```typescript
// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const Portfolio = lazy(() => import('../pages/Portfolio'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectManagement />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

Use React.memo, useMemo, and useCallback appropriately:

```typescript
// Memoize expensive calculations
const expensiveData = useMemo(() => {
  return processLargeDataSet(rawData);
}, [rawData]);

// Memoize callbacks to prevent unnecessary re-renders
const handleProjectUpdate = useCallback((projectId: string, updates: Partial<Project>) => {
  updateProjectMutation.mutate({ id: projectId, ...updates });
}, [updateProjectMutation]);

// Memoize components
const ProjectCard = memo<ProjectCardProps>(({ project, onUpdate }) => {
  return (
    <div className="project-card">
      {/* Component content */}
    </div>
  );
});
```

### Bundle Analysis

Add bundle analyzer to check bundle size:

```bash
npm install --save-dev vite-bundle-analyzer
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    // ... other plugins
    analyzer({ analyzerMode: 'server' })
  ],
});
```

## 📱 Accessibility

### ARIA Labels and Roles

```tsx
<button
  aria-label="Edit task"
  aria-describedby="task-description"
  onClick={() => onEdit(task)}
>
  <EditIcon />
</button>

<div
  id="task-description"
  className="sr-only"
>
  Edit task: {task.title}
</div>
```

### Keyboard Navigation

```tsx
const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(task);
    }
  };

  return (
    <div
      className="task-card"
      tabIndex={0}
      role="button"
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(task)}
    >
      {/* Card content */}
    </div>
  );
};
```

### Focus Management

```tsx
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog
      ref={modalRef}
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {children}
    </Dialog>
  );
};
```

## 🔧 Development Tools

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "jsx-a11y/anchor-is-valid": "off"
  }
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

This comprehensive guide provides everything needed to develop and maintain high-quality frontend code for the 3D Printer Project.