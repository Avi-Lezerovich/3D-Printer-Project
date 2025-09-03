import { PortfolioContainer } from '../features/portfolio';

/**
 * Portfolio Page Entry Point
 * 
 * Professional portfolio page following enterprise architecture patterns:
 * - Clean separation between page routing and business logic
 * - Container-presentational pattern implementation
 * - Centralized portfolio functionality in dedicated container
 * 
 * This replaces the previous 704-line monolithic component with
 * a clean, maintainable structure following professional standards.
 */
export default function Portfolio() {
  return <PortfolioContainer />;
}