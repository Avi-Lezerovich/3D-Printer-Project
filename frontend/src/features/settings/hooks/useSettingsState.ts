import { useReducer } from 'react';
import type { SettingsState, SettingsAction } from '../types';

const initialSettingsState: SettingsState = {
  user: {
    profile: {
      name: 'User',
      email: 'user@example.com',
      avatar: '',
      timezone: 'UTC',
      language: 'en',
      theme: 'dark'
    },
    notifications: {
      email: true,
      push: true,
      desktop: false,
      printComplete: true,
      printFailed: true,
      maintenance: false
    },
    preferences: {
      units: 'metric',
      autoConnect: true,
      showAdvanced: false,
      confirmActions: true
    }
  },
  printer: {
    connection: {
      port: '/dev/ttyUSB0',
      baudrate: 115200,
      autoConnect: false,
      timeout: 30
    },
    bed: {
      width: 220,
      height: 220,
      shape: 'rectangular'
    },
    extruder: {
      count: 1,
      hotendMaxTemp: 300,
      retraction: 5
    },
    firmware: {
      type: 'marlin',
      version: '2.0.0',
      features: []
    }
  },
  system: {
    logging: {
      level: 'info',
      retention: 30,
      maxSize: '100MB'
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 7
    },
    security: {
      sessionTimeout: 60,
      requireAuth: true,
      allowRemoteAccess: false
    }
  },
  isLoading: false,
  error: null,
  lastSaved: null
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'LOAD_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'LOAD_SUCCESS':
      return { 
        ...state, 
        ...action.payload, 
        isLoading: false, 
        error: null 
      };
    
    case 'LOAD_ERROR':
      return { 
        ...state, 
        isLoading: false, 
        error: action.error 
      };
    
    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastSaved: new Date()
      };
    
    case 'UPDATE_PRINTER_SETTINGS':
      return {
        ...state,
        printer: { ...state.printer, ...action.payload },
        lastSaved: new Date()
      };
    
    case 'UPDATE_SYSTEM_SETTINGS':
      return {
        ...state,
        system: { ...state.system, ...action.payload },
        lastSaved: new Date()
      };
    
    case 'RESET_SETTINGS':
      return initialSettingsState;
    
    default:
      return state;
  }
}

export const useSettingsState = () => {
  return useReducer(settingsReducer, initialSettingsState);
};