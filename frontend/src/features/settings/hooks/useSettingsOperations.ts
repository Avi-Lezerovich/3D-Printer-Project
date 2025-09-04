import { useCallback } from 'react';
import { settingsService } from '../services';
import type { UserSettings, PrinterSettings, SystemSettings } from '../types';

export const useSettingsOperations = (dispatch: any) => {
  const loadSettings = useCallback(async () => {
    dispatch({ type: 'LOAD_REQUEST' });
    try {
      const settings = await settingsService.loadSettings();
      dispatch({ type: 'LOAD_SUCCESS', payload: settings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  const updateUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
    try {
      await settingsService.saveUserSettings(settings);
      dispatch({ type: 'UPDATE_USER_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  const updatePrinterSettings = useCallback(async (settings: Partial<PrinterSettings>) => {
    try {
      await settingsService.savePrinterSettings(settings);
      dispatch({ type: 'UPDATE_PRINTER_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    try {
      await settingsService.saveSystemSettings(settings);
      dispatch({ type: 'UPDATE_SYSTEM_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  const resetSettings = useCallback(async () => {
    try {
      await settingsService.resetSettings();
      dispatch({ type: 'RESET_SETTINGS' });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  const exportSettings = useCallback(async () => {
    try {
      return await settingsService.exportSettings();
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
      throw error;
    }
  }, [dispatch]);

  const importSettings = useCallback(async (file: File) => {
    try {
      const settings = await settingsService.importSettings(file);
      dispatch({ type: 'LOAD_SUCCESS', payload: settings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: error.message });
    }
  }, [dispatch]);

  return {
    loadSettings,
    updateUserSettings,
    updatePrinterSettings,
    updateSystemSettings,
    resetSettings,
    exportSettings,
    importSettings
  };
};