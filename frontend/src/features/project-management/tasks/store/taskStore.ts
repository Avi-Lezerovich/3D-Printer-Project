/**
 * Task Management Store
 * Lightweight Zustand store focused only on task-related state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Task, 
  TaskFormData, 
  FilterState, 
  SortState, 
  PaginationState,
  UseTasksResult
} from '../../shared/types';
import { taskAPI } from '../../../../services/project-management-api';
import { filterTasks, sortTasks } from '../../shared/utils';
import { STORAGE_KEYS } from '../../shared/constants';
import { mockTasks } from '../../shared/mockData';

interface TaskState {
  // Data
  tasks: Task[];
  selectedTask: Task | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
  
  // View State
  viewMode: 'list' | 'grid' | 'kanban';
  showCompleted: boolean;
  searchQuery: string;
  
  // Modals
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
}

interface TaskActions {
  // Data Actions
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: Task | null) => void;
  
  // Filter Actions
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortState) => void;
  
  // View Actions
  setViewMode: (mode: 'list' | 'grid' | 'kanban') => void;
  toggleCompleted: () => void;
  
  // Modal Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (task: Task) => void;
  closeDeleteConfirm: () => void;
  
  // Utility Actions
  refresh: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

type TaskStore = TaskState & TaskActions;

// Default state
const defaultState: TaskState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: { page: 1, pageSize: 20, total: 0 },
  viewMode: 'list',
  showCompleted: true,
  searchQuery: '',
  showCreateModal: false,
  showEditModal: false,
  showDeleteConfirm: false,
};

// Load persisted state from localStorage
const loadPersistedState = (): Partial<TaskState> => {
  try {
    const savedFilters = localStorage.getItem(STORAGE_KEYS.TASK_FILTERS);
    const savedViewPrefs = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
    
    return {
      filters: savedFilters ? JSON.parse(savedFilters) : {},
      ...(savedViewPrefs ? JSON.parse(savedViewPrefs) : {}),
    };
  } catch (error) {
    console.warn('Failed to load persisted task state:', error);
    return {};
  }
};

// Create the store
export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // Initialize with default state and persisted data
      ...defaultState,
      ...loadPersistedState(),
      
      // Data Actions
      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const tasks = await taskAPI.list(filters);
          set({ 
            tasks, 
            loading: false,
            pagination: {
              ...get().pagination,
              total: tasks.length
            }
          });
        } catch (error) {
          console.warn('Task API failed, using mock data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
          // Use mock data as fallback
          set({ 
            tasks: mockTasks,
            loading: false,
            error: `${errorMessage} (using demo data)`,
            pagination: {
              ...get().pagination,
              total: mockTasks.length
            }
          });
        }
      },

      createTask: async (taskData: TaskFormData) => {
        set({ loading: true, error: null });
        try {
          const newTask = await taskAPI.create(taskData);
          const { tasks } = get();
          set({ 
            tasks: [newTask, ...tasks], 
            loading: false,
            showCreateModal: false,
            pagination: {
              ...get().pagination,
              total: tasks.length + 1
            }
          });
          return newTask;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateTask: async (id: string, taskData: Partial<TaskFormData>) => {
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
            showEditModal: false,
            selectedTask: updatedTask
          });
          return updatedTask;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await taskAPI.delete(id);
          const { tasks } = get();
          const filteredTasks = tasks.filter(task => task.id !== id);
          set({ 
            tasks: filteredTasks, 
            loading: false,
            showDeleteConfirm: false,
            selectedTask: null,
            pagination: {
              ...get().pagination,
              total: filteredTasks.length
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
          set({ error: errorMessage, loading: false });
        }
      },

      selectTask: (task: Task | null) => {
        set({ selectedTask: task });
      },

      // Filter Actions
      setFilters: (filters: FilterState) => {
        set({ filters });
        // Persist to localStorage
        try {
          localStorage.setItem(STORAGE_KEYS.TASK_FILTERS, JSON.stringify(filters));
        } catch (error) {
          console.warn('Failed to persist filters:', error);
        }
        // Refresh data with new filters
        get().fetchTasks();
      },

      clearFilters: () => {
        const clearedFilters = {};
        set({ filters: clearedFilters, searchQuery: '' });
        try {
          localStorage.removeItem(STORAGE_KEYS.TASK_FILTERS);
        } catch (error) {
          console.warn('Failed to clear persisted filters:', error);
        }
        get().fetchTasks();
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSort: (sort: SortState) => {
        set({ sort });
      },

      // View Actions
      setViewMode: (mode: 'list' | 'grid' | 'kanban') => {
        set({ viewMode: mode });
        // Persist view preferences
        try {
          const currentPrefs = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES) || '{}'
          );
          localStorage.setItem(
            STORAGE_KEYS.VIEW_PREFERENCES, 
            JSON.stringify({ ...currentPrefs, taskViewMode: mode })
          );
        } catch (error) {
          console.warn('Failed to persist view mode:', error);
        }
      },

      toggleCompleted: () => {
        const { showCompleted } = get();
        set({ showCompleted: !showCompleted });
      },

      // Modal Actions
      openCreateModal: () => set({ showCreateModal: true }),
      closeCreateModal: () => set({ showCreateModal: false }),
      
      openEditModal: (task: Task) => {
        set({ selectedTask: task, showEditModal: true });
      },
      closeEditModal: () => {
        set({ showEditModal: false, selectedTask: null });
      },
      
      openDeleteConfirm: (task: Task) => {
        set({ selectedTask: task, showDeleteConfirm: true });
      },
      closeDeleteConfirm: () => {
        set({ showDeleteConfirm: false, selectedTask: null });
      },

      // Utility Actions
      refresh: async () => {
        await get().fetchTasks();
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(defaultState);
        try {
          localStorage.removeItem(STORAGE_KEYS.TASK_FILTERS);
        } catch (error) {
          console.warn('Failed to clear persisted state:', error);
        }
      },
    }),
    {
      name: 'task-store',
    }
  )
);

// Computed selectors for derived state
export const useTaskSelectors = () => {
  const store = useTaskStore();
  
  const getFilteredTasks = () => {
    const { tasks, filters, searchQuery, sort, showCompleted } = store;
    let filtered = tasks;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply completion filter
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'done');
    }
    
    // Apply other filters
    filtered = filterTasks(filtered, filters);
    
    // Apply sorting
    return sortTasks(filtered, sort);
  };
  
  return {
    // Filtered and sorted tasks
    filteredTasks: getFilteredTasks,
    
    // Task statistics
    taskStats: () => {
      const tasks = store.tasks;
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'done').length;
      const inProgress = tasks.filter(task => task.status === 'in-progress').length;
      const overdue = tasks.filter((task: Task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'done';
      }).length;
      
      return {
        total,
        completed,
        inProgress,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    },
    
    // Kanban columns for kanban view
    kanbanColumns: () => {
      const tasks = getFilteredTasks();
      return {
        todo: tasks.filter((task: Task) => task.status === 'todo'),
        'in-progress': tasks.filter((task: Task) => task.status === 'in-progress'),
        review: tasks.filter((task: Task) => task.status === 'review'),
        done: tasks.filter((task: Task) => task.status === 'done'),
      };
    },
    
    // Paginated tasks for list/grid view
    paginatedTasks: () => {
      const tasks = getFilteredTasks();
      const { pagination } = store;
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      
      return {
        tasks: tasks.slice(startIndex, endIndex),
        hasMore: endIndex < tasks.length,
        totalPages: Math.ceil(tasks.length / pagination.pageSize),
      };
    },
  };
};

// Hook for easy access to tasks functionality
export const useTasks = (): UseTasksResult => {
  const store = useTaskStore();
  const selectors = useTaskSelectors();
  
  return {
    tasks: selectors.filteredTasks(),
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    setFilters: store.setFilters,
    createTask: store.createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    refresh: store.refresh,
  };
};
