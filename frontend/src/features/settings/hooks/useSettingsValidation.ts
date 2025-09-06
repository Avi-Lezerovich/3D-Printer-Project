import { useState, useCallback } from 'react';
import type { UserSettings, PrinterSettings, SystemSettings, ValidationState } from '../types';

const initialValidationState: ValidationState = {
  isValid: true,
  errors: {},
  warnings: {}
};

export const useSettingsValidation = () => {
  const [validation, setValidation] = useState<ValidationState>(initialValidationState);

  const validateUserSettings = useCallback((settings: UserSettings) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Profile validation
    if (!settings.profile?.name?.trim()) {
      errors['profile.name'] = 'Name is required';
    }

    if (!settings.profile?.email?.includes('@')) {
      errors['profile.email'] = 'Valid email is required';
    }

    // Notifications validation
    if (settings.notifications?.email && !settings.profile?.email) {
      warnings['notifications.email'] = 'Email notifications require a valid email address';
    }

    return { errors, warnings };
  }, []);

  const validatePrinterSettings = useCallback((settings: PrinterSettings) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Connection validation
    if (!settings.connection?.port) {
      errors['connection.port'] = 'Port is required';
    }

    if (settings.connection?.baudrate < 9600) {
      errors['connection.baudrate'] = 'Baudrate must be at least 9600';
    }

    // Bed validation
    if (settings.bed?.width <= 0 || settings.bed?.height <= 0) {
      errors['bed.dimensions'] = 'Bed dimensions must be positive';
    }

    // Extruder validation
    if (settings.extruder?.hotendMaxTemp > 350) {
      warnings['extruder.hotendMaxTemp'] = 'High temperature may damage the hotend';
    }

    return { errors, warnings };
  }, []);

  const validateSystemSettings = useCallback((settings: SystemSettings) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Security validation
    if (settings.security?.sessionTimeout < 5) {
      errors['security.sessionTimeout'] = 'Session timeout must be at least 5 minutes';
    }

    if (settings.security?.allowRemoteAccess && !settings.security?.requireAuth) {
      errors['security.auth'] = 'Remote access requires authentication';
    }

    // Backup validation
    if (settings.backup?.retention < 1) {
      errors['backup.retention'] = 'Backup retention must be at least 1 day';
    }

    return { errors, warnings };
  }, []);

  const validateSettings = useCallback((settings: UserSettings | PrinterSettings | SystemSettings, type: 'user' | 'printer' | 'system') => {
    let result = { errors: {}, warnings: {} };

    switch (type) {
      case 'user':
        result = validateUserSettings(settings);
        break;
      case 'printer':
        result = validatePrinterSettings(settings);
        break;
      case 'system':
        result = validateSystemSettings(settings);
        break;
    }

    const isValid = Object.keys(result.errors).length === 0;
    
    setValidation({
      isValid,
      errors: result.errors,
      warnings: result.warnings
    });

    return isValid;
  }, [validateUserSettings, validatePrinterSettings, validateSystemSettings]);

  const clearValidation = useCallback(() => {
    setValidation(initialValidationState);
  }, []);

  return {
    validation,
    validateSettings,
    clearValidation
  };
};