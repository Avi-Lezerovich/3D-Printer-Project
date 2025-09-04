/**
 * Settings Custom Hooks - Professional Business Logic Layer
 * 
 * Main settings hook that orchestrates all settings functionality
 * using smaller, focused hooks for better maintainability.
 */

import { useEffect } from 'react';
import { useSettingsState } from './useSettingsState';
import { useSettingsValidation } from './useSettingsValidation';
import { useSettingsOperations } from './useSettingsOperations';

export const useSettings = () => {
  const [state, dispatch] = useSettingsState();
  const { validation, validateSettings, clearValidation } = useSettingsValidation();
  const operations = useSettingsOperations(dispatch);

  // Load settings on mount
  useEffect(() => {
    operations.loadSettings();
  }, [operations.loadSettings]);

  return {
    // State
    ...state,
    validation,
    
    // Operations
    ...operations,
    
    // Validation
    validateSettings,
    clearValidation
  };
};