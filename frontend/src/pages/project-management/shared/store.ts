/**
 * Project Management Store
 * Using Zustand for state management following clean architecture principles
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Task, 
  BudgetCategory, 
  BudgetExpense, 
  InventoryItem, 
  ProjectAnalyticsSummary,
  taskAPI,
  budgetAPI,
  inventoryAPI,
  analyticsAPI
} from '../../../services/project-management-api';

// Combined store interface
interface ProjectManagementStore {
  // Task state
  tasks: Task[];
  selectedTask: Task | null;
  taskLoading: boolean;
  taskError: string | null;
  taskFilters: {
    status?: string;
    priority?: string;
    assignee?: string;
  };
  
  // Budget state
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  budgetLoading: boolean;
  budgetError: string | null;
  
  // Inventory state
  items: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  inventoryFilters: {
    status?: string;
    supplier?: string;
  };
  
  // Analytics state
  summary: ProjectAnalyticsSummary | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
  
  // UI state
  activeTab: 'overview' | 'budget' | 'inventory' | 'analytics';
  sidebarOpen: boolean;
  modals: {
    addTask: boolean;
    editTask: boolean;
    addInventory: boolean;
    addBudgetCategory: boolean;
  };
  theme: 'light' | 'dark';
  
  // Task actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: Task | null) => void;
  setTaskFilters: (filters: ProjectManagementStore['taskFilters']) => void;
  
  // Budget actions
  fetchBudgetData: () => Promise<void>;
  createBudgetCategory: (categoryData: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Inventory actions
  fetchInventory: () => Promise<void>;
  createInventoryItem: (itemData: Omit<InventoryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<void>;
  setInventoryFilters: (filters: ProjectManagementStore['inventoryFilters']) => void;
  
  // Analytics actions
  fetchAnalytics: () => Promise<void>;
  
  // UI actions
  setActiveTab: (tab: ProjectManagementStore['activeTab']) => void;
  toggleSidebar: () => void;
  openModal: (modal: keyof ProjectManagementStore['modals']) => void;
  closeModal: (modal: keyof ProjectManagementStore['modals']) => void;
  closeAllModals: () => void;
  setTheme: (theme: ProjectManagementStore['theme']) => void;
  
  // General actions
  clearErrors: () => void;
  resetStore: () => void;
}

// Create the store
export const useProjectManagementStore = create<ProjectManagementStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      selectedTask: null,
      taskLoading: false,
      taskError: null,
      taskFilters: {},
      
      categories: [],
      expenses: [],
      budgetLoading: false,
      budgetError: null,
      
      items: [],
      inventoryLoading: false,
      inventoryError: null,
      inventoryFilters: {},
      
      summary: null,
      analyticsLoading: false,
      analyticsError: null,
      
      activeTab: 'overview',
      sidebarOpen: true,
      modals: {
        addTask: false,
        editTask: false,
        addInventory: false,
        addBudgetCategory: false,
      },
      theme: 'light',

      // Task actions
      fetchTasks: async () => {
        set({ taskLoading: true, taskError: null });
        try {
          const { taskFilters } = get();
          const tasks = await taskAPI.list(taskFilters);
          set({ tasks, taskLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
          set({ taskError: errorMessage, taskLoading: false });
        }
      },

      createTask: async (taskData) => {
        set({ taskLoading: true, taskError: null });
        try {
          const newTask = await taskAPI.create(taskData);
          const { tasks } = get();
          set({ 
            tasks: [...tasks, newTask], 
            taskLoading: false,
            modals: { ...get().modals, addTask: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
          set({ taskError: errorMessage, taskLoading: false });
        }
      },

      updateTask: async (id, taskData) => {
        set({ taskLoading: true, taskError: null });
        try {
          const updatedTask = await taskAPI.update(id, taskData);
          const { tasks } = get();
          const updatedTasks = tasks.map(task => 
            task.id === id ? updatedTask : task
          );
          set({ 
            tasks: updatedTasks, 
            taskLoading: false,
            selectedTask: get().selectedTask?.id === id ? updatedTask : get().selectedTask,
            modals: { ...get().modals, editTask: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
          set({ taskError: errorMessage, taskLoading: false });
        }
      },

      deleteTask: async (id) => {
        set({ taskLoading: true, taskError: null });
        try {
          await taskAPI.delete(id);
          const { tasks } = get();
          const filteredTasks = tasks.filter(task => task.id !== id);
          set({ 
            tasks: filteredTasks, 
            taskLoading: false,
            selectedTask: get().selectedTask?.id === id ? null : get().selectedTask
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
          set({ taskError: errorMessage, taskLoading: false });
        }
      },

      selectTask: (task) => {
        set({ selectedTask: task });
      },

      setTaskFilters: (filters) => {
        set({ taskFilters: filters });
        get().fetchTasks();
      },

      // Budget actions
      fetchBudgetData: async () => {
        set({ budgetLoading: true, budgetError: null });
        try {
          const [categories, expenses] = await Promise.all([
            budgetAPI.getCategories(),
            budgetAPI.getExpenses()
          ]);
          set({ categories, expenses, budgetLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch budget data';
          set({ budgetError: errorMessage, budgetLoading: false });
        }
      },

      createBudgetCategory: async (categoryData) => {
        set({ budgetLoading: true, budgetError: null });
        try {
          const newCategory = await budgetAPI.createCategory(categoryData);
          const { categories } = get();
          set({ 
            categories: [...categories, newCategory], 
            budgetLoading: false,
            modals: { ...get().modals, addBudgetCategory: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create budget category';
          set({ budgetError: errorMessage, budgetLoading: false });
        }
      },

      // Inventory actions
      fetchInventory: async () => {
        set({ inventoryLoading: true, inventoryError: null });
        try {
          const { inventoryFilters } = get();
          const items = await inventoryAPI.list(inventoryFilters);
          set({ items, inventoryLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory';
          set({ inventoryError: errorMessage, inventoryLoading: false });
        }
      },

      createInventoryItem: async (itemData) => {
        set({ inventoryLoading: true, inventoryError: null });
        try {
          const newItem = await inventoryAPI.create(itemData);
          const { items } = get();
          set({ 
            items: [...items, newItem], 
            inventoryLoading: false,
            modals: { ...get().modals, addInventory: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create inventory item';
          set({ inventoryError: errorMessage, inventoryLoading: false });
        }
      },

      updateInventoryQuantity: async (id, quantity) => {
        set({ inventoryLoading: true, inventoryError: null });
        try {
          const updatedItem = await inventoryAPI.updateQuantity(id, quantity);
          const { items } = get();
          const updatedItems = items.map(item => 
            item.id === id ? updatedItem : item
          );
          set({ items: updatedItems, inventoryLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory quantity';
          set({ inventoryError: errorMessage, inventoryLoading: false });
        }
      },

      setInventoryFilters: (filters) => {
        set({ inventoryFilters: filters });
        get().fetchInventory();
      },

      // Analytics actions
      fetchAnalytics: async () => {
        set({ analyticsLoading: true, analyticsError: null });
        try {
          const summary = await analyticsAPI.getSummary();
          set({ summary, analyticsLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
          set({ analyticsError: errorMessage, analyticsLoading: false });
        }
      },

      // UI actions
      setActiveTab: (activeTab) => {
        set({ activeTab });
        // Auto-fetch data when switching tabs
        switch (activeTab) {
          case 'overview':
            get().fetchTasks();
            break;
          case 'budget':
            get().fetchBudgetData();
            break;
          case 'inventory':
            get().fetchInventory();
            break;
          case 'analytics':
            get().fetchAnalytics();
            break;
        }
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },

      openModal: (modal) => {
        set({ 
          modals: { ...get().modals, [modal]: true }
        });
      },

      closeModal: (modal) => {
        set({ 
          modals: { ...get().modals, [modal]: false }
        });
      },

      closeAllModals: () => {
        set({ 
          modals: {
            addTask: false,
            editTask: false,
            addInventory: false,
            addBudgetCategory: false,
          }
        });
      },

      setTheme: (theme) => {
        set({ theme });
        // Persist theme preference
        localStorage.setItem('pm-theme', theme);
      },

      // General actions
      clearErrors: () => {
        set({ 
          taskError: null,
          budgetError: null,
          inventoryError: null,
          analyticsError: null
        });
      },

      resetStore: () => {
        set({
          tasks: [],
          selectedTask: null,
          taskLoading: false,
          taskError: null,
          taskFilters: {},
          
          categories: [],
          expenses: [],
          budgetLoading: false,
          budgetError: null,
          
          items: [],
          inventoryLoading: false,
          inventoryError: null,
          inventoryFilters: {},
          
          summary: null,
          analyticsLoading: false,
          analyticsError: null,
          
          activeTab: 'overview' as const,
          sidebarOpen: true,
          modals: {
            addTask: false,
            editTask: false,
            addInventory: false,
            addBudgetCategory: false,
          },
          theme: 'light' as const,
        });
      },
    }),
    {
      name: 'project-management-store',
    }
  )
);

// Utility hooks for specific parts of the store
export const useTaskStore = () => {
  const store = useProjectManagementStore();
  return {
    tasks: store.tasks,
    selectedTask: store.selectedTask,
    loading: store.taskLoading,
    error: store.taskError,
    filters: store.taskFilters,
    fetchTasks: store.fetchTasks,
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    selectTask: store.selectTask,
    setTaskFilters: store.setTaskFilters,
  };
};

export const useBudgetStore = () => {
  const store = useProjectManagementStore();
  return {
    categories: store.categories,
    expenses: store.expenses,
    loading: store.budgetLoading,
    error: store.budgetError,
    fetchBudgetData: store.fetchBudgetData,
    createBudgetCategory: store.createBudgetCategory,
  };
};

export const useInventoryStore = () => {
  const store = useProjectManagementStore();
  return {
    items: store.items,
    loading: store.inventoryLoading,
    error: store.inventoryError,
    filters: store.inventoryFilters,
    fetchInventory: store.fetchInventory,
    createInventoryItem: store.createInventoryItem,
    updateInventoryQuantity: store.updateInventoryQuantity,
    setInventoryFilters: store.setInventoryFilters,
  };
};

export const useAnalyticsStore = () => {
  const store = useProjectManagementStore();
  return {
    summary: store.summary,
    loading: store.analyticsLoading,
    error: store.analyticsError,
    fetchAnalytics: store.fetchAnalytics,
  };
};

export const useUIStore = () => {
  const store = useProjectManagementStore();
  return {
    activeTab: store.activeTab,
    sidebarOpen: store.sidebarOpen,
    modals: store.modals,
    theme: store.theme,
    setActiveTab: store.setActiveTab,
    toggleSidebar: store.toggleSidebar,
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    setTheme: store.setTheme,
  };
};

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Task, 
  BudgetCategory, 
  BudgetExpense, 
  InventoryItem, 
  ProjectAnalyticsSummary,
  taskAPI,
  budgetAPI,
  inventoryAPI,
  analyticsAPI
} from '../../../services/project-management-api';

// State interfaces
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  taskLoading: boolean;
  taskError: string | null;
  taskFilters: {
    status?: string;
    priority?: string;
    assignee?: string;
  };
}

interface BudgetState {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  budgetLoading: boolean;
  budgetError: string | null;
}

interface InventoryState {
  items: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  inventoryFilters: {
    status?: string;
    supplier?: string;
  };
}

interface AnalyticsState {
  summary: ProjectAnalyticsSummary | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
}

interface UIState {
  activeTab: 'overview' | 'budget' | 'inventory' | 'analytics';
  sidebarOpen: boolean;
  modals: {
    addTask: boolean;
    editTask: boolean;
    addInventory: boolean;
    addBudgetCategory: boolean;
  };
  theme: 'light' | 'dark';
}

// Combined store interface
interface ProjectManagementStore extends TaskState, BudgetState, InventoryState, AnalyticsState, UIState {
  // Task actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: Task | null) => void;
  setTaskFilters: (filters: TaskState['filters']) => void;
  
  // Budget actions
  fetchBudgetData: () => Promise<void>;
  createBudgetCategory: (categoryData: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Inventory actions
  fetchInventory: () => Promise<void>;
  createInventoryItem: (itemData: Omit<InventoryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<void>;
  setInventoryFilters: (filters: InventoryState['filters']) => void;
  
  // Analytics actions
  fetchAnalytics: () => Promise<void>;
  
  // UI actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  toggleSidebar: () => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  setTheme: (theme: UIState['theme']) => void;
  
  // General actions
  clearErrors: () => void;
  resetStore: () => void;
}

// Initial state
const initialState = {
  // Task state
  tasks: [],
  selectedTask: null,
  filters: {},
  
  // Budget state
  categories: [],
  expenses: [],
  
  // Inventory state
  items: [],
  
  // Analytics state
  summary: null,
  
  // UI state
  activeTab: 'overview' as const,
  sidebarOpen: true,
  modals: {
    addTask: false,
    editTask: false,
    addInventory: false,
    addBudgetCategory: false,
  },
  theme: 'light' as const,
  
  // Loading and error states
  loading: false,
  error: null,
};

// Create the store
export const useProjectManagementStore = create<ProjectManagementStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Task actions
      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const tasks = await taskAPI.list(filters);
          set({ tasks, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
          set({ error: errorMessage, loading: false });
        }
      },

      createTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
          const newTask = await taskAPI.create(taskData);
          const { tasks } = get();
          set({ 
            tasks: [...tasks, newTask], 
            loading: false,
            modals: { ...get().modals, addTask: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
          set({ error: errorMessage, loading: false });
        }
      },

      updateTask: async (id, taskData) => {
        set({ loading: true, error: null });
        try {
          const updatedTask = await taskAPI.update(id, taskData);
          const { tasks } = get();
          const updatedTasks = tasks.map(task => 
            task.id === id ? updatedTask : task
          );
          set({ 
            tasks: updatedTasks, 
            loading: false,
            selectedTask: get().selectedTask?.id === id ? updatedTask : get().selectedTask,
            modals: { ...get().modals, editTask: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
          set({ error: errorMessage, loading: false });
        }
      },

      deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
          await taskAPI.delete(id);
          const { tasks } = get();
          const filteredTasks = tasks.filter(task => task.id !== id);
          set({ 
            tasks: filteredTasks, 
            loading: false,
            selectedTask: get().selectedTask?.id === id ? null : get().selectedTask
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
          set({ error: errorMessage, loading: false });
        }
      },

      selectTask: (task) => {
        set({ selectedTask: task });
      },

      setTaskFilters: (filters) => {
        set({ filters });
        get().fetchTasks();
      },

      // Budget actions
      fetchBudgetData: async () => {
        set({ loading: true, error: null });
        try {
          const [categories, expenses] = await Promise.all([
            budgetAPI.getCategories(),
            budgetAPI.getExpenses()
          ]);
          set({ categories, expenses, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch budget data';
          set({ error: errorMessage, loading: false });
        }
      },

      createBudgetCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await budgetAPI.createCategory(categoryData);
          const { categories } = get();
          set({ 
            categories: [...categories, newCategory], 
            loading: false,
            modals: { ...get().modals, addBudgetCategory: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create budget category';
          set({ error: errorMessage, loading: false });
        }
      },

      // Inventory actions
      fetchInventory: async () => {
        set({ loading: true, error: null });
        try {
          const inventoryFilters = get().filters;
          const items = await inventoryAPI.list(inventoryFilters);
          set({ items, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory';
          set({ error: errorMessage, loading: false });
        }
      },

      createInventoryItem: async (itemData) => {
        set({ loading: true, error: null });
        try {
          const newItem = await inventoryAPI.create(itemData);
          const { items } = get();
          set({ 
            items: [...items, newItem], 
            loading: false,
            modals: { ...get().modals, addInventory: false }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create inventory item';
          set({ error: errorMessage, loading: false });
        }
      },

      updateInventoryQuantity: async (id, quantity) => {
        set({ loading: true, error: null });
        try {
          const updatedItem = await inventoryAPI.updateQuantity(id, quantity);
          const { items } = get();
          const updatedItems = items.map(item => 
            item.id === id ? updatedItem : item
          );
          set({ items: updatedItems, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory quantity';
          set({ error: errorMessage, loading: false });
        }
      },

      setInventoryFilters: (inventoryFilters) => {
        set({ filters: inventoryFilters });
        get().fetchInventory();
      },

      // Analytics actions
      fetchAnalytics: async () => {
        set({ loading: true, error: null });
        try {
          const summary = await analyticsAPI.getSummary();
          set({ summary, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
          set({ error: errorMessage, loading: false });
        }
      },

      // UI actions
      setActiveTab: (activeTab) => {
        set({ activeTab });
        // Auto-fetch data when switching tabs
        switch (activeTab) {
          case 'overview':
            get().fetchTasks();
            break;
          case 'budget':
            get().fetchBudgetData();
            break;
          case 'inventory':
            get().fetchInventory();
            break;
          case 'analytics':
            get().fetchAnalytics();
            break;
        }
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },

      openModal: (modal) => {
        set({ 
          modals: { ...get().modals, [modal]: true }
        });
      },

      closeModal: (modal) => {
        set({ 
          modals: { ...get().modals, [modal]: false }
        });
      },

      closeAllModals: () => {
        set({ 
          modals: {
            addTask: false,
            editTask: false,
            addInventory: false,
            addBudgetCategory: false,
          }
        });
      },

      setTheme: (theme) => {
        set({ theme });
        // Persist theme preference
        localStorage.setItem('pm-theme', theme);
      },

      // General actions
      clearErrors: () => {
        set({ error: null });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'project-management-store',
    }
  )
);

// Utility hooks for specific parts of the store
export const useTaskStore = () => {
  const store = useProjectManagementStore();
  return {
    tasks: store.tasks,
    selectedTask: store.selectedTask,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    fetchTasks: store.fetchTasks,
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    selectTask: store.selectTask,
    setTaskFilters: store.setTaskFilters,
  };
};

export const useBudgetStore = () => {
  const store = useProjectManagementStore();
  return {
    categories: store.categories,
    expenses: store.expenses,
    loading: store.loading,
    error: store.error,
    fetchBudgetData: store.fetchBudgetData,
    createBudgetCategory: store.createBudgetCategory,
  };
};

export const useInventoryStore = () => {
  const store = useProjectManagementStore();
  return {
    items: store.items,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    fetchInventory: store.fetchInventory,
    createInventoryItem: store.createInventoryItem,
    updateInventoryQuantity: store.updateInventoryQuantity,
    setInventoryFilters: store.setInventoryFilters,
  };
};

export const useAnalyticsStore = () => {
  const store = useProjectManagementStore();
  return {
    summary: store.summary,
    loading: store.loading,
    error: store.error,
    fetchAnalytics: store.fetchAnalytics,
  };
};

export const useUIStore = () => {
  const store = useProjectManagementStore();
  return {
    activeTab: store.activeTab,
    sidebarOpen: store.sidebarOpen,
    modals: store.modals,
    theme: store.theme,
    setActiveTab: store.setActiveTab,
    toggleSidebar: store.toggleSidebar,
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    setTheme: store.setTheme,
  };
};
