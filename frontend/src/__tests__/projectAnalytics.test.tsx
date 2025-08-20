import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsAnalyticsPanel } from '../features/projects/ProjectsAnalyticsPanel';

vi.mock('../features/projects/useProjects', () => ({
  useProjects: () => ({ isLoading: false, error: null, data: { projects: [
    { id:'1', name:'A', status:'new' },
    { id:'2', name:'B', status:'in_progress' },
    { id:'3', name:'C', status:'in_progress' },
    { id:'4', name:'D', status:'done' }
  ] }})
}));

// Mock recharts to avoid chart rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container" style={{ width: '100%', height: '220px' }}>
      {children}
    </div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('ProjectsAnalyticsPanel', () => {
  it('renders stats list', async () => {
    const qc = new QueryClient();
    render(<QueryClientProvider client={qc}><ProjectsAnalyticsPanel /></QueryClientProvider>);
    
    await waitFor(()=> screen.getByText(/Total Projects: 4/));
    expect(screen.getByText(/in_progress/i)).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
