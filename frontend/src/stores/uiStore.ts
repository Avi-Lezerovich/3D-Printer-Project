import { create } from 'zustand';

type ModalType = 'login' | 'register' | 'settings';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  activeModal: ModalType | null;
  notifications: Notification[];
  
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addNotification: (notification: Notification) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark', // Default to dark theme
  sidebarOpen: true,
  activeModal: null,
  notifications: [],
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark',
  })),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification],
  })),
}));
