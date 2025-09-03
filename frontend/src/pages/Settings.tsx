import { SettingsContainer } from '../features/settings';

/**
 * Settings Page Entry Point
 * 
 * Professional settings page following enterprise architecture patterns:
 * - Clean separation between page routing and business logic
 * - Container-presentational pattern implementation
 * - Centralized settings functionality in dedicated container
 * 
 * This replaces the previous 949-line monolithic component with
 * a clean, maintainable structure following professional standards.
 */
export default function Settings() {
  return <SettingsContainer />;
}
