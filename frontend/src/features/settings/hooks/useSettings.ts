/**
 * Settings Custom Hooks - Professional Business Logic Layer
 * 
 * Enterprise-grade custom hooks for settings management with:
 * - Clean separation of concerns
 * - Type-safe state management
 * - Error handling and loading states
 * - Optimistic updates
 * - Validation logic
 */

import { useState, useEffect, useCallback, useReducer } from 'react';
import { settingsService, ApiError, ValidationError } from '../services';
import type { 
  SettingsState, 
  SettingsAction, 
  ValidationState,
  UserSettings,
  SystemSettings
} from '../types';

// ========================================
// Settings State Management Hook
// ========================================

/**
 * Main settings hook with comprehensive state management
 */
export const useSettings = () => {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      dispatch({ type: 'SAVE_SETTINGS_START' });
      const settings = await settingsService.getSettings();
      
      // Update state with loaded settings
      dispatch({ type: 'SET_USER_SETTING', payload: { key: 'user' as keyof UserSettings, value: settings.user } });
      dispatch({ type: 'SET_SYSTEM_SETTING', payload: { key: 'system' as keyof SystemSettings, value: settings.system } });
      
      dispatch({ 
        type: 'SAVE_SETTINGS_SUCCESS', 
        payload: { timestamp: new Date().toISOString() } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      dispatch({ type: 'SAVE_SETTINGS_ERROR', payload: { error: errorMessage } });
    }
  }, []);

  const saveSettings = useCallback(async () => {
    try {
      dispatch({ type: 'SAVE_SETTINGS_START' });
      
      await settingsService.saveSettings({
        user: state.user,
        system: state.system,
      });

      dispatch({ 
        type: 'SAVE_SETTINGS_SUCCESS', 
        payload: { timestamp: new Date().toISOString() } 
      });
    } catch (error) {
      let errorMessage = 'Failed to save settings';
      
      if (error instanceof ValidationError) {
        // Handle validation errors
        Object.entries(error.errors).forEach(([field, validation]) => {
          dispatch({ 
            type: 'SET_VALIDATION_ERROR', 
            payload: { field, validation } 
          });
        });
        errorMessage = 'Settings validation failed';
      } else if (error instanceof ApiError) {
        errorMessage = `Save failed: ${error.message}`;
      }

      dispatch({ type: 'SAVE_SETTINGS_ERROR', payload: { error: errorMessage } });
    }
  }, [state.user, state.system]);

  const resetSettings = useCallback(async () => {
    try {
      dispatch({ type: 'SAVE_SETTINGS_START' });
      await settingsService.resetSettings();
      dispatch({ type: 'RESET_SETTINGS' });
      await loadSettings(); // Reload fresh settings
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
      dispatch({ type: 'SAVE_SETTINGS_ERROR', payload: { error: errorMessage } });
    }
  }, [loadSettings]);

  const updateUserSetting = useCallback(<K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    dispatch({ type: 'SET_USER_SETTING', payload: { key, value } });
  }, []);

  const updateSystemSetting = useCallback(<K extends keyof SystemSettings>(
    key: K, 
    value: SystemSettings[K]
  ) => {
    dispatch({ type: 'SET_SYSTEM_SETTING', payload: { key, value } });
  }, []);

  const validateField = useCallback((field: string, value: unknown) => {
    const validation = settingsService.validateSetting(field, value);
    
    if (validation.isValid) {
      dispatch({ type: 'CLEAR_VALIDATION_ERROR', payload: { field } });
    } else {
      dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field, validation } });
    }

    return validation;
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    loadSettings,
    saveSettings,
    resetSettings,
    updateUserSetting,
    updateSystemSetting,
    validateField,
  };
};

// ========================================
// Specialized Settings Hooks
// ========================================

/**
 * Hook for user profile and preferences
 */
export const useUserSettings = () => {
  const { user, updateUserSetting, isLoading, errors } = useSettings();

  const updateProfile = useCallback((updates: Partial<UserSettings['profile']>) => {
    updateUserSetting('profile', { ...user.profile, ...updates });
  }, [user.profile, updateUserSetting]);

  const updatePreferences = useCallback((updates: Partial<UserSettings['preferences']>) => {
    updateUserSetting('preferences', { ...user.preferences, ...updates });
  }, [user.preferences, updateUserSetting]);

  const updateSecurity = useCallback((updates: Partial<UserSettings['security']>) => {
    updateUserSetting('security', { ...user.security, ...updates });
  }, [user.security, updateUserSetting]);

  return {
    profile: user.profile,
    preferences: user.preferences,
    security: user.security,
    updateProfile,
    updatePreferences,
    updateSecurity,
    isLoading,
    errors,
  };
};

/**
 * Hook for system settings
 */
export const useSystemSettings = () => {
  const { system, updateSystemSetting, isLoading, errors } = useSettings();

  const updatePrinterSettings = useCallback((updates: Partial<SystemSettings['printer']>) => {
    updateSystemSetting('printer', { ...system.printer, ...updates });
  }, [system.printer, updateSystemSetting]);

  const updateMonitoringSettings = useCallback((updates: Partial<SystemSettings['monitoring']>) => {
    updateSystemSetting('monitoring', { ...system.monitoring, ...updates });
  }, [system.monitoring, updateSystemSetting]);

  const updateStorageSettings = useCallback((updates: Partial<SystemSettings['storage']>) => {
    updateSystemSetting('storage', { ...system.storage, ...updates });
  }, [system.storage, updateSystemSetting]);

  return {
    printer: system.printer,
    monitoring: system.monitoring,
    storage: system.storage,
    performance: system.performance,
    backup: system.backup,
    updatePrinterSettings,
    updateMonitoringSettings,
    updateStorageSettings,
    isLoading,
    errors,
  };
};

/**
 * Hook for settings validation
 */
export const useSettingsValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationState>>({});

  const validateField = useCallback((field: string, value: unknown): ValidationState => {
    const validation = settingsService.validateSetting(field, value);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      
      if (validation.isValid) {
        delete newErrors[field];
      } else {
        newErrors[field] = validation;
      }
      
      return newErrors;
    });

    return validation;
  }, []);

  const clearValidation = useCallback((field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllValidations = useCallback(() => {
    setValidationErrors({});
  }, []);

  const hasErrors = Object.keys(validationErrors).length > 0;
  const getFieldError = useCallback((field: string) => validationErrors[field], [validationErrors]);

  return {
    validationErrors,
    validateField,
    clearValidation,
    clearAllValidations,
    hasErrors,
    getFieldError,
  };
};

/**
 * Hook for settings import/export
 */
export const useSettingsImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSettings = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const blob = await settingsService.exportSettings();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `3d-printer-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importSettings = useCallback(async (file: File) => {
    try {
      setIsImporting(true);
      setError(null);
      
      await settingsService.importSettings(file);
      
      // Trigger a page reload or settings refresh
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    exportSettings,
    importSettings,
    isExporting,
    isImporting,
    error,
  };
};

// ========================================
// Settings Reducer
// ========================================

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_USER_SETTING':
      return {
        ...state,
        user: {
          ...state.user,
          [action.payload.key]: action.payload.value,
        },
        hasChanges: true,
      };

    case 'SET_SYSTEM_SETTING':
      return {
        ...state,
        system: {
          ...state.system,
          [action.payload.key]: action.payload.value,
        },
        hasChanges: true,
      };

    case 'SAVE_SETTINGS_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'SAVE_SETTINGS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        hasChanges: false,
        lastSaved: action.payload.timestamp,
        errors: {},
      };

    case 'SAVE_SETTINGS_ERROR':
      return {
        ...state,
        isLoading: false,
        errors: {
          ...state.errors,
          general: {
            isValid: false,
            message: action.payload.error,
            type: 'error',
          },
        },
      };

    case 'RESET_SETTINGS':
      return {
        ...initialSettingsState,
        hasChanges: true,
      };

    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.validation,
        },
      };

    case 'CLEAR_VALIDATION_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.payload.field];
      return {
        ...state,
        errors: newErrors,
      };

    default:
      return state;
  }
};

// ========================================
// Initial State
// ========================================

const initialSettingsState: SettingsState = {
  user: {
    profile: {
      id: '',
      name: '',
      email: '',
      role: 'user',
      createdAt: '',
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      temperatureUnit: 'celsius',
      notifications: {
        email: {
          printComplete: true,
          printError: true,
          maintenanceReminder: true,
          systemUpdates: false,
          weeklyReport: false,
        },
        push: {
          enabled: true,
          printComplete: true,
          printError: true,
          temperatureAlert: true,
          filamentLow: true,
        },
        desktop: {
          enabled: true,
          printComplete: true,
          printError: true,
          systemAlert: true,
        },
        sound: {
          enabled: true,
          volume: 50,
          completionSound: 'chime',
          errorSound: 'alert',
          alertSound: 'notification',
        },
      },
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        expiration: 90,
      },
      apiKeys: [],
      auditLog: true,
    },
  },
  system: {
    printer: {
      defaultTemperature: {
        bed: 60,
        extruder: 200,
        maxBed: 120,
        maxExtruder: 260,
        alertThresholds: {
          low: 50,
          high: 250,
        },
      },
      autoShutdown: {
        enabled: false,
        idleTime: 60,
        afterPrintComplete: false,
        onError: true,
      },
      maintenance: {
        reminderInterval: 100,
        autoClean: false,
        calibrationReminder: true,
        filamentChangeReminder: true,
      },
      calibration: {
        autoBedLeveling: true,
        zOffset: 0,
        steps: {
          x: 80,
          y: 80,
          z: 400,
          e: 95,
        },
      },
    },
    monitoring: {
      webcam: {
        enabled: true,
        resolution: '720p',
        framerate: 30,
        recording: false,
        timelapse: false,
      },
      sensors: {
        temperature: true,
        humidity: false,
        air_quality: false,
        vibration: false,
        power: true,
      },
      logging: {
        level: 'info',
        retention: 30,
        maxSize: 100,
        autoClean: true,
      },
      realtime: {
        updateInterval: 5,
        maxConnections: 10,
        compression: true,
        heartbeat: true,
      },
    },
    storage: {
      maxFileSize: 100,
      allowedFormats: ['gcode', 'g', 'stl'],
      autoCleanup: true,
      cleanupInterval: 30,
      cloudSync: {
        enabled: false,
        provider: 'aws',
        autoSync: false,
        syncInterval: 24,
      },
    },
    performance: {
      cacheSize: 256,
      preloadContent: true,
      compression: true,
      maxConcurrentUploads: 3,
      networkTimeout: 30,
    },
    backup: {
      enabled: true,
      frequency: 'weekly',
      retention: 4,
      includeFiles: false,
      cloudBackup: false,
      encryption: true,
    },
  },
  isLoading: false,
  hasChanges: false,
  errors: {},
};
