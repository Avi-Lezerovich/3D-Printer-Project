import { HelpContainer } from '../features/help';

/**
 * Help Page Entry Point
 * 
 * Professional help page following enterprise architecture patterns:
 * - Clean separation between page routing and business logic
 * - Container-presentational pattern implementation
 * - Centralized help functionality in dedicated container
 * 
 * This replaces the previous 369-line monolithic component with
 * a clean, maintainable structure following professional standards.
 */
export default function Help() {
  return <HelpContainer />;
}