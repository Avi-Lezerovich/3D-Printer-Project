import { PortfolioContainer } from '../features/portfolio';

/**
 * Portfolio Page Entry Point
 * 
 * Professional portfolio page following enterprise architecture patterns:
 * - Clean separation between page routing and business logic
 * - Container-presentational pattern implementation
 * - Centralized portfolio functionality in dedicated container
 */
export default function PortfolioPage() {
  return <PortfolioContainer />;
}