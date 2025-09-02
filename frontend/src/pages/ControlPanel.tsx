import { ControlPanelContainer } from '../features/control-panel';

/**
 * Control Panel Page - Entry Point
 * 
 * This is now a simple wrapper that imports the professionally
 * refactored ControlPanelContainer component. The actual logic
 * and UI are cleanly separated into the features/control-panel module.
 * 
 * Benefits of this refactor:
 * - Single Responsibility: Each component has one clear purpose
 * - Testability: Components are easier to unit test
 * - Reusability: Components can be reused in other contexts
 * - Maintainability: Code is organized and easy to understand
 * - Performance: Better tree-shaking and code splitting
 */
export default function ControlPanel() {
  return <ControlPanelContainer />;
}
