/**
 * Settings Types - Professional TypeScript Definitions
 * 
 * Comprehensive type definitions for the settings system following
 * enterprise-grade patterns with strict typing and validation.
 */

// ========================================
// Core Settings Types
// ========================================

export interface ValidationState {
  readonly isValid: boolean;
  readonly message?: string;
  readonly type?: 'error' | 'success' | 'warning';
}

export interface SettingsFormField {
  readonly id: string;
  readonly type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'toggle' | 'range';
  readonly label: string;
  readonly placeholder?: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly validation?: ValidationState;
  readonly options?: readonly string[];
  readonly min?: number;
  readonly max?: number;
}

// ========================================
// User Settings
// ========================================

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly role: 'admin' | 'user' | 'viewer';
  readonly lastLogin?: string;
  readonly createdAt: string;
}

export interface UserSettings {
  readonly profile: UserProfile;
  readonly preferences: UserPreferences;
  readonly security: SecuritySettings;
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'system';
  readonly language: string;
  readonly timezone: string;
  readonly dateFormat: string;
  readonly temperatureUnit: 'celsius' | 'fahrenheit';
  readonly notifications: NotificationSettings;
}

// ========================================
// Notification Settings
// ========================================

export interface NotificationSettings {
  readonly email: EmailNotifications;
  readonly push: PushNotifications;
  readonly desktop: DesktopNotifications;
  readonly sound: SoundSettings;
}

export interface EmailNotifications {
  readonly printComplete: boolean;
  readonly printError: boolean;
  readonly maintenanceReminder: boolean;
  readonly systemUpdates: boolean;
  readonly weeklyReport: boolean;
}

export interface PushNotifications {
  readonly enabled: boolean;
  readonly printComplete: boolean;
  readonly printError: boolean;
  readonly temperatureAlert: boolean;
  readonly filamentLow: boolean;
}

export interface DesktopNotifications {
  readonly enabled: boolean;
  readonly printComplete: boolean;
  readonly printError: boolean;
  readonly systemAlert: boolean;
}

export interface SoundSettings {
  readonly enabled: boolean;
  readonly volume: number;
  readonly completionSound: string;
  readonly errorSound: string;
  readonly alertSound: string;
}

// ========================================
// System Settings
// ========================================

export interface SystemSettings {
  readonly printer: PrinterSettings;
  readonly monitoring: MonitoringSettings;
  readonly storage: StorageSettings;
  readonly performance: PerformanceSettings;
  readonly backup: BackupSettings;
}

export interface PrinterSettings {
  readonly defaultTemperature: TemperatureSettings;
  readonly autoShutdown: AutoShutdownSettings;
  readonly maintenance: MaintenanceSettings;
  readonly calibration: CalibrationSettings;
}

export interface TemperatureSettings {
  readonly bed: number;
  readonly extruder: number;
  readonly maxBed: number;
  readonly maxExtruder: number;
  readonly alertThresholds: {
    readonly low: number;
    readonly high: number;
  };
}

export interface AutoShutdownSettings {
  readonly enabled: boolean;
  readonly idleTime: number; // minutes
  readonly afterPrintComplete: boolean;
  readonly onError: boolean;
}

export interface MaintenanceSettings {
  readonly reminderInterval: number; // hours
  readonly autoClean: boolean;
  readonly calibrationReminder: boolean;
  readonly filamentChangeReminder: boolean;
}

export interface CalibrationSettings {
  readonly autoBedLeveling: boolean;
  readonly zOffset: number;
  readonly steps: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly e: number;
  };
}

// ========================================
// Monitoring & Performance
// ========================================

export interface MonitoringSettings {
  readonly webcam: WebcamSettings;
  readonly sensors: SensorSettings;
  readonly logging: LoggingSettings;
  readonly realtime: RealtimeSettings;
}

export interface WebcamSettings {
  readonly enabled: boolean;
  readonly resolution: '720p' | '1080p' | '1440p';
  readonly framerate: 15 | 30 | 60;
  readonly recording: boolean;
  readonly timelapse: boolean;
}

export interface SensorSettings {
  readonly temperature: boolean;
  readonly humidity: boolean;
  readonly air_quality: boolean;
  readonly vibration: boolean;
  readonly power: boolean;
}

export interface LoggingSettings {
  readonly level: 'error' | 'warn' | 'info' | 'debug';
  readonly retention: number; // days
  readonly maxSize: number; // MB
  readonly autoClean: boolean;
}

export interface RealtimeSettings {
  readonly updateInterval: number; // seconds
  readonly maxConnections: number;
  readonly compression: boolean;
  readonly heartbeat: boolean;
}

// ========================================
// Storage & Performance
// ========================================

export interface StorageSettings {
  readonly maxFileSize: number; // MB
  readonly allowedFormats: readonly string[];
  readonly autoCleanup: boolean;
  readonly cleanupInterval: number; // days
  readonly cloudSync: CloudSyncSettings;
}

export interface CloudSyncSettings {
  readonly enabled: boolean;
  readonly provider: 'aws' | 'gcp' | 'azure' | 'dropbox';
  readonly autoSync: boolean;
  readonly syncInterval: number; // hours
}

export interface PerformanceSettings {
  readonly cacheSize: number; // MB
  readonly preloadContent: boolean;
  readonly compression: boolean;
  readonly maxConcurrentUploads: number;
  readonly networkTimeout: number; // seconds
}

// ========================================
// Backup & Security
// ========================================

export interface BackupSettings {
  readonly enabled: boolean;
  readonly frequency: 'daily' | 'weekly' | 'monthly';
  readonly retention: number; // count
  readonly includeFiles: boolean;
  readonly cloudBackup: boolean;
  readonly encryption: boolean;
}

export interface SecuritySettings {
  readonly twoFactorAuth: boolean;
  readonly sessionTimeout: number; // minutes
  readonly passwordPolicy: PasswordPolicy;
  readonly apiKeys: readonly ApiKey[];
  readonly auditLog: boolean;
}

export interface PasswordPolicy {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumbers: boolean;
  readonly requireSymbols: boolean;
  readonly expiration: number; // days, 0 for no expiration
}

export interface ApiKey {
  readonly id: string;
  readonly name: string;
  readonly key: string;
  readonly permissions: readonly string[];
  readonly lastUsed?: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
}

// ========================================
// Settings Actions & State
// ========================================

export interface SettingsState {
  readonly user: UserSettings;
  readonly system: SystemSettings;
  readonly isLoading: boolean;
  readonly hasChanges: boolean;
  readonly lastSaved?: string;
  readonly errors: Record<string, ValidationState>;
}

export type SettingsAction = 
  | { type: 'SET_USER_SETTING'; payload: { key: keyof UserSettings; value: unknown } }
  | { type: 'SET_SYSTEM_SETTING'; payload: { key: keyof SystemSettings; value: unknown } }
  | { type: 'SAVE_SETTINGS_START' }
  | { type: 'SAVE_SETTINGS_SUCCESS'; payload: { timestamp: string } }
  | { type: 'SAVE_SETTINGS_ERROR'; payload: { error: string } }
  | { type: 'RESET_SETTINGS' }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; validation: ValidationState } }
  | { type: 'CLEAR_VALIDATION_ERROR'; payload: { field: string } };

// ========================================
// Component Props Interfaces
// ========================================

export interface SettingsContainerProps {
  readonly initialSettings?: Partial<SettingsState>;
}

export interface SettingsSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly children: React.ReactNode;
  readonly defaultExpanded?: boolean;
}

export interface SettingsFormProps {
  readonly fields: readonly SettingsFormField[];
  readonly values: Record<string, unknown>;
  readonly onChange: (field: string, value: unknown) => void;
  readonly onValidate: (field: string, validation: ValidationState) => void;
}

// ========================================
// Service Interfaces
// ========================================

export interface SettingsService {
  readonly getSettings: () => Promise<SettingsState>;
  readonly saveSettings: (settings: Partial<SettingsState>) => Promise<void>;
  readonly resetSettings: () => Promise<void>;
  readonly validateSetting: (key: string, value: unknown) => ValidationState;
  readonly exportSettings: () => Promise<Blob>;
  readonly importSettings: (file: File) => Promise<void>;
}

// ========================================
// Utility Types
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type SettingsPath<T> = T extends object 
  ? { [K in keyof T]: `${K & string}` | `${K & string}.${SettingsPath<T[K]>}` }[keyof T]
  : never;

// Type guards for runtime type checking
export const isValidationState = (obj: unknown): obj is ValidationState => {
  return typeof obj === 'object' && obj !== null && 'isValid' in obj;
};

export const isUserSettings = (obj: unknown): obj is UserSettings => {
  return typeof obj === 'object' && obj !== null && 'profile' in obj && 'preferences' in obj;
};

export const isSystemSettings = (obj: unknown): obj is SystemSettings => {
  return typeof obj === 'object' && obj !== null && 'printer' in obj && 'monitoring' in obj;
};
