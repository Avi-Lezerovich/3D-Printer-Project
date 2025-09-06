/**
 * Settings Feature Module - Professional Export Hub
 * 
 * Centralized exports for the entire settings feature module
 * following enterprise-grade barrel export patterns.
 */

// Components
export { SettingsContainer } from './SettingsContainer';
export * from './components';

// Hooks  
export * from './hooks';

// Services
export * from './services';

// Types (explicitly named to avoid conflicts)
export type {
  ValidationState,
  SettingsFormField,
  UserProfile,
  UserSettings,
  UserPreferences,
  NotificationSettings as NotificationSettingsType,
  EmailNotifications,
  PushNotifications,
  DesktopNotifications,
  SoundSettings,
  SystemSettings,
  PrinterSettings as PrinterSettingsType,
  TemperatureSettings,
  AutoShutdownSettings,
  MaintenanceSettings,
  CalibrationSettings,
  MonitoringSettings,
  WebcamSettings,
  SensorSettings,
  LoggingSettings,
  RealtimeSettings,
  StorageSettings,
  CloudSyncSettings,
  PerformanceSettings,
  BackupSettings,
  SecuritySettings,
  PasswordPolicy,
  ApiKey,
  SettingsState,
  SettingsAction,
  SettingsContainerProps,
  SettingsSectionProps,
  SettingsFormProps,
  SettingsService,
  DeepPartial,
  SettingsPath
} from './types';