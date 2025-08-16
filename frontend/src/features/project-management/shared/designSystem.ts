/**
 * Project Management Design System
 * Centralized design tokens and theme configuration
 */

export const designTokens = {
  // Colors
  colors: {
    // Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Status Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  
  // Typography
  typography: {
    fontFamilies: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Z-Index
  zIndex: {
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Component-specific design patterns
export const componentPatterns = {
  // Card variants
  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: designTokens.borderRadius.lg,
      boxShadow: designTokens.shadows.base,
      border: `1px solid ${designTokens.colors.gray[200]}`,
    },
    
    interactive: {
      cursor: 'pointer',
      transition: `all ${designTokens.transitions.duration.base} ${designTokens.transitions.easing.out}`,
      '&:hover': {
        boxShadow: designTokens.shadows.lg,
        transform: 'translateY(-2px)',
      },
    },
    
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  
  // Button variants
  button: {
    primary: {
      backgroundColor: designTokens.colors.primary[600],
      color: 'white',
      '&:hover': {
        backgroundColor: designTokens.colors.primary[700],
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[200]}`,
      },
    },
    
    secondary: {
      backgroundColor: designTokens.colors.gray[100],
      color: designTokens.colors.gray[700],
      '&:hover': {
        backgroundColor: designTokens.colors.gray[200],
      },
    },
    
    success: {
      backgroundColor: designTokens.colors.success[600],
      color: 'white',
      '&:hover': {
        backgroundColor: designTokens.colors.success[700],
      },
    },
    
    danger: {
      backgroundColor: designTokens.colors.danger[600],
      color: 'white',
      '&:hover': {
        backgroundColor: designTokens.colors.danger[700],
      },
    },
  },
  
  // Status indicators
  status: {
    success: {
      color: designTokens.colors.success[700],
      backgroundColor: designTokens.colors.success[100],
      borderColor: designTokens.colors.success[200],
    },
    
    warning: {
      color: designTokens.colors.warning[700],
      backgroundColor: designTokens.colors.warning[100],
      borderColor: designTokens.colors.warning[200],
    },
    
    danger: {
      color: designTokens.colors.danger[700],
      backgroundColor: designTokens.colors.danger[100],
      borderColor: designTokens.colors.danger[200],
    },
    
    info: {
      color: designTokens.colors.primary[700],
      backgroundColor: designTokens.colors.primary[100],
      borderColor: designTokens.colors.primary[200],
    },
  },
} as const;

// Utility functions
export const getStatusColor = (status: string) => {
  const statusColorMap = {
    todo: componentPatterns.status.info,
    'in-progress': componentPatterns.status.warning,
    review: componentPatterns.status.warning,
    done: componentPatterns.status.success,
    completed: componentPatterns.status.success,
    overdue: componentPatterns.status.danger,
    'on-budget': componentPatterns.status.success,
    'over-budget': componentPatterns.status.danger,
    'in-stock': componentPatterns.status.success,
    'low-stock': componentPatterns.status.warning,
    'out-of-stock': componentPatterns.status.danger,
  };
  
  return statusColorMap[status as keyof typeof statusColorMap] || componentPatterns.status.info;
};

export const getPriorityColor = (priority: string) => {
  const priorityColorMap = {
    low: componentPatterns.status.success,
    medium: componentPatterns.status.warning,
    high: componentPatterns.status.danger,
    urgent: {
      ...componentPatterns.status.danger,
      fontWeight: designTokens.typography.fontWeights.bold,
    },
  };
  
  return priorityColorMap[priority as keyof typeof priorityColorMap] || componentPatterns.status.info;
};

export type DesignTokens = typeof designTokens;
export type ComponentPatterns = typeof componentPatterns;
