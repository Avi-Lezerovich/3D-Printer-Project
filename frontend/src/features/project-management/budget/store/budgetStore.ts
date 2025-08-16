/**
 * Budget Management Store
 * Focused store for budget categories, expenses, and financial analytics
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  BudgetCategory, 
  BudgetExpense, 
  BudgetCategoryFormData, 
  BudgetExpenseFormData,
  BudgetMetrics,
  UseBudgetResult
} from '../../shared/types';
import { budgetAPI } from '../../../../services/project-management-api';
import { STORAGE_KEYS } from '../../shared/constants';
import { mockBudgetCategories, mockBudgetExpenses } from '../../shared/mockData';

interface BudgetState {
  // Data
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  metrics: BudgetMetrics | null;
  selectedCategory: BudgetCategory | null;
  selectedExpense: BudgetExpense | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // View State
  viewMode: 'categories' | 'expenses' | 'analytics';
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  showOnlyOverBudget: boolean;
  
  // Modals
  showCreateCategoryModal: boolean;
  showEditCategoryModal: boolean;
  showCreateExpenseModal: boolean;
  showEditExpenseModal: boolean;
  showDeleteConfirm: boolean;
}

interface BudgetActions {
  // Data Actions
  fetchBudgetData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  
  // Category Actions
  createCategory: (data: BudgetCategoryFormData) => Promise<BudgetCategory>;
  updateCategory: (id: string, data: Partial<BudgetCategoryFormData>) => Promise<BudgetCategory>;
  deleteCategory: (id: string) => Promise<void>;
  selectCategory: (category: BudgetCategory | null) => void;
  
  // Expense Actions
  createExpense: (data: BudgetExpenseFormData) => Promise<BudgetExpense>;
  updateExpense: (id: string, data: Partial<BudgetExpenseFormData>) => Promise<BudgetExpense>;
  deleteExpense: (id: string) => Promise<void>;
  selectExpense: (expense: BudgetExpense | null) => void;
  
  // View Actions
  setViewMode: (mode: 'categories' | 'expenses' | 'analytics') => void;
  setSelectedPeriod: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  toggleOverBudgetFilter: () => void;
  
  // Modal Actions
  openCreateCategoryModal: () => void;
  closeCreateCategoryModal: () => void;
  openEditCategoryModal: (category: BudgetCategory) => void;
  closeEditCategoryModal: () => void;
  openCreateExpenseModal: (categoryId?: string) => void;
  closeCreateExpenseModal: () => void;
  openEditExpenseModal: (expense: BudgetExpense) => void;
  closeEditExpenseModal: () => void;
  openDeleteConfirm: (item: BudgetCategory | BudgetExpense) => void;
  closeDeleteConfirm: () => void;
  
  // Utility Actions
  refresh: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

type BudgetStore = BudgetState & BudgetActions;

// Default state
const defaultState: BudgetState = {
  categories: [],
  expenses: [],
  metrics: null,
  selectedCategory: null,
  selectedExpense: null,
  loading: false,
  error: null,
  viewMode: 'categories',
  selectedPeriod: 'month',
  showOnlyOverBudget: false,
  showCreateCategoryModal: false,
  showEditCategoryModal: false,
  showCreateExpenseModal: false,
  showEditExpenseModal: false,
  showDeleteConfirm: false,
};

// Load persisted preferences
const loadPersistedPreferences = (): Partial<BudgetState> => {
  try {
    const savedPrefs = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      return {
        viewMode: prefs.budgetViewMode || 'categories',
        selectedPeriod: prefs.budgetPeriod || 'month',
        showOnlyOverBudget: prefs.showOnlyOverBudget || false,
      };
    }
  } catch (error) {
    console.warn('Failed to load budget preferences:', error);
  }
  return {};
};

// Create the store
export const useBudgetStore = create<BudgetStore>()(
  devtools(
    (set, get) => ({
      // Initialize with default state and persisted preferences
      ...defaultState,
      ...loadPersistedPreferences(),
      
      // Data Actions
      fetchBudgetData: async () => {
        set({ loading: true, error: null });
        try {
          const { fetchCategories, fetchExpenses, fetchMetrics } = get();
          await Promise.all([
            fetchCategories(),
            fetchExpenses(),
            fetchMetrics()
          ]);
          set({ loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch budget data';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const categories = await budgetAPI.getCategories();
          set({ categories, loading: false });
        } catch (error) {
          console.warn('Budget categories API failed, using mock data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
          set({ 
            categories: mockBudgetCategories,
            loading: false,
            error: `${errorMessage} (using demo data)`
          });
        }
      },

      fetchExpenses: async () => {
        set({ loading: true, error: null });
        try {
          const expenses = await budgetAPI.getExpenses();
          set({ expenses, loading: false });
        } catch (error) {
          console.warn('Budget expenses API failed, using mock data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expenses';
          set({ 
            expenses: mockBudgetExpenses,
            loading: false,
            error: `${errorMessage} (using demo data)`
          });
        }
      },

      fetchMetrics: async () => {
        try {
          // For now, calculate metrics from existing data since API doesn't have metrics endpoint
          const { categories, expenses } = get();
          const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
          const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
          
          const metrics = {
            totalBudget,
            totalSpent,
            totalRemaining: totalBudget - totalSpent,
            utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            spendingTrend: 'stable' as const,
            categoryBreakdown: categories.map(cat => {
              const categoryExpenses = expenses.filter(exp => exp.categoryId === cat.id);
              const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              return {
                categoryId: cat.id,
                categoryName: cat.name,
                budgeted: cat.budgetedAmount,
                spent,
                percentage: totalSpent > 0 ? (spent / totalSpent) * 100 : 0
              };
            }),
            monthlySpending: [] // TODO: Implement when we have date-based data
          };
          
          set({ metrics });
        } catch (error) {
          console.warn('Failed to calculate budget metrics:', error);
        }
      },

      // Category Actions
      createCategory: async (categoryData: BudgetCategoryFormData) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await budgetAPI.createCategory(categoryData);
          const { categories } = get();
          set({ 
            categories: [newCategory, ...categories], 
            loading: false,
            showCreateCategoryModal: false 
          });
          return newCategory;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateCategory: async (id: string, categoryData: Partial<BudgetCategoryFormData>) => {
        set({ loading: true, error: null });
        try {
          const updatedCategory = await budgetAPI.updateCategory(id, categoryData);
          const { categories } = get();
          const updatedCategories = categories.map(cat => 
            cat.id === id ? updatedCategory : cat
          );
          set({ 
            categories: updatedCategories, 
            loading: false,
            showEditCategoryModal: false,
            selectedCategory: updatedCategory
          });
          return updatedCategory;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteCategory: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await budgetAPI.deleteCategory(id);
          const { categories } = get();
          const filteredCategories = categories.filter(cat => cat.id !== id);
          set({ 
            categories: filteredCategories, 
            loading: false,
            showDeleteConfirm: false,
            selectedCategory: null
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
          set({ error: errorMessage, loading: false });
        }
      },

      selectCategory: (category: BudgetCategory | null) => {
        set({ selectedCategory: category });
      },

      // Expense Actions
      createExpense: async (expenseData: BudgetExpenseFormData) => {
        set({ loading: true, error: null });
        try {
          const newExpense = await budgetAPI.createExpense(expenseData);
          const { expenses } = get();
          set({ 
            expenses: [newExpense, ...expenses], 
            loading: false,
            showCreateExpenseModal: false 
          });
          // Refresh metrics after adding expense
          get().fetchMetrics();
          return newExpense;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create expense';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateExpense: async (id: string, expenseData: Partial<BudgetExpenseFormData>) => {
        set({ loading: true, error: null });
        try {
          const updatedExpense = await budgetAPI.updateExpense(id, expenseData);
          const { expenses } = get();
          const updatedExpenses = expenses.map(exp => 
            exp.id === id ? updatedExpense : exp
          );
          set({ 
            expenses: updatedExpenses, 
            loading: false,
            showEditExpenseModal: false,
            selectedExpense: updatedExpense
          });
          // Refresh metrics after updating expense
          get().fetchMetrics();
          return updatedExpense;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update expense';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteExpense: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await budgetAPI.deleteExpense(id);
          const { expenses } = get();
          const filteredExpenses = expenses.filter(exp => exp.id !== id);
          set({ 
            expenses: filteredExpenses, 
            loading: false,
            showDeleteConfirm: false,
            selectedExpense: null
          });
          // Refresh metrics after deleting expense
          get().fetchMetrics();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
          set({ error: errorMessage, loading: false });
        }
      },

      selectExpense: (expense: BudgetExpense | null) => {
        set({ selectedExpense: expense });
      },

      // View Actions
      setViewMode: (mode: 'categories' | 'expenses' | 'analytics') => {
        set({ viewMode: mode });
        // Persist preference
        try {
          const currentPrefs = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES) || '{}'
          );
          localStorage.setItem(
            STORAGE_KEYS.VIEW_PREFERENCES, 
            JSON.stringify({ ...currentPrefs, budgetViewMode: mode })
          );
        } catch (error) {
          console.warn('Failed to persist budget view mode:', error);
        }
      },

      setSelectedPeriod: (period: 'week' | 'month' | 'quarter' | 'year') => {
        set({ selectedPeriod: period });
        // Refresh metrics with new period
        get().fetchMetrics();
        // Persist preference
        try {
          const currentPrefs = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES) || '{}'
          );
          localStorage.setItem(
            STORAGE_KEYS.VIEW_PREFERENCES, 
            JSON.stringify({ ...currentPrefs, budgetPeriod: period })
          );
        } catch (error) {
          console.warn('Failed to persist budget period:', error);
        }
      },

      toggleOverBudgetFilter: () => {
        const { showOnlyOverBudget } = get();
        set({ showOnlyOverBudget: !showOnlyOverBudget });
      },

      // Modal Actions
      openCreateCategoryModal: () => set({ showCreateCategoryModal: true }),
      closeCreateCategoryModal: () => set({ showCreateCategoryModal: false }),
      
      openEditCategoryModal: (category: BudgetCategory) => {
        set({ selectedCategory: category, showEditCategoryModal: true });
      },
      closeEditCategoryModal: () => {
        set({ showEditCategoryModal: false, selectedCategory: null });
      },
      
      openCreateExpenseModal: (categoryId?: string) => {
        if (categoryId) {
          const { categories } = get();
          const category = categories.find(cat => cat.id === categoryId);
          set({ selectedCategory: category || null });
        }
        set({ showCreateExpenseModal: true });
      },
      closeCreateExpenseModal: () => {
        set({ showCreateExpenseModal: false, selectedCategory: null });
      },
      
      openEditExpenseModal: (expense: BudgetExpense) => {
        set({ selectedExpense: expense, showEditExpenseModal: true });
      },
      closeEditExpenseModal: () => {
        set({ showEditExpenseModal: false, selectedExpense: null });
      },
      
      openDeleteConfirm: (item: BudgetCategory | BudgetExpense) => {
        if ('budgetedAmount' in item) {
          // It's a category
          set({ selectedCategory: item as BudgetCategory, showDeleteConfirm: true });
        } else {
          // It's an expense
          set({ selectedExpense: item as BudgetExpense, showDeleteConfirm: true });
        }
      },
      closeDeleteConfirm: () => {
        set({ 
          showDeleteConfirm: false, 
          selectedCategory: null, 
          selectedExpense: null 
        });
      },

      // Utility Actions
      refresh: async () => {
        await get().fetchBudgetData();
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(defaultState);
      },
    }),
    {
      name: 'budget-store',
    }
  )
);

// Computed selectors for derived budget state
export const useBudgetSelectors = () => {
  const store = useBudgetStore();
  
  return {
    // Categories with spending data
    categoriesWithSpending: () => {
      const { categories, expenses } = store;
      return categories.map(category => {
        const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
        const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = category.budgetedAmount - totalSpent;
        const utilization = category.budgetedAmount > 0 
          ? (totalSpent / category.budgetedAmount) * 100 
          : 0;
        
        return {
          ...category,
          totalSpent,
          remaining,
          utilization,
          isOverBudget: totalSpent > category.budgetedAmount,
          expenseCount: categoryExpenses.length,
          lastExpenseDate: categoryExpenses.length > 0 
            ? new Date(Math.max(...categoryExpenses.map(exp => new Date(exp.date).getTime())))
            : null
        };
      });
    },
    
    // Budget overview statistics
    budgetOverview: () => {
      const categoriesWithSpending = store.categories.map(category => {
        const categoryExpenses = store.expenses.filter(exp => exp.categoryId === category.id);
        const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return { ...category, totalSpent };
      });
      
      const totalBudget = categoriesWithSpending.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
      const totalSpent = categoriesWithSpending.reduce((sum, cat) => sum + cat.totalSpent, 0);
      const totalRemaining = totalBudget - totalSpent;
      const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const overBudgetCategories = categoriesWithSpending.filter(cat => cat.totalSpent > cat.budgetedAmount);
      
      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        utilizationRate,
        overBudgetCount: overBudgetCategories.length,
        categoryCount: categoriesWithSpending.length,
        expenseCount: store.expenses.length,
        averageCategoryUtilization: categoriesWithSpending.length > 0 
          ? categoriesWithSpending.reduce((sum, cat) => {
              const utilization = cat.budgetedAmount > 0 ? (cat.totalSpent / cat.budgetedAmount) * 100 : 0;
              return sum + utilization;
            }, 0) / categoriesWithSpending.length 
          : 0
      };
    },
    
    // Recent expenses (last 30 days)
    recentExpenses: () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return store.expenses
        .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    // Filtered categories (when showOnlyOverBudget is true)
    filteredCategories: () => {
      const categoriesWithSpending = store.categories.map(category => {
        const categoryExpenses = store.expenses.filter(exp => exp.categoryId === category.id);
        const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return { ...category, totalSpent, isOverBudget: totalSpent > category.budgetedAmount };
      });
      
      if (store.showOnlyOverBudget) {
        return categoriesWithSpending.filter(cat => cat.isOverBudget);
      }
      
      return categoriesWithSpending;
    }
  };
};

// Hook for easy access to budget functionality
export const useBudget = (): UseBudgetResult => {
  const store = useBudgetStore();
  
  return {
    categories: store.categories,
    expenses: store.expenses,
    metrics: store.metrics,
    loading: store.loading,
    error: store.error,
    createCategory: store.createCategory,
    createExpense: store.createExpense,
    updateCategory: store.updateCategory,
    updateExpense: store.updateExpense,
    deleteCategory: store.deleteCategory,
    deleteExpense: store.deleteExpense,
    refresh: store.refresh,
  };
};
