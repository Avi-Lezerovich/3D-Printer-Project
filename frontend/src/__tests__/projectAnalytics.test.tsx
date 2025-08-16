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

describe('ProjectsAnalyticsPanel', () => {
  it('renders stats list', async () => {
    const qc = new QueryClient();
    render(<QueryClientProvider client={qc}><ProjectsAnalyticsPanel /></QueryClientProvider>);
    await waitFor(()=> screen.getByText(/Total Projects: 4/));
    expect(screen.getByText(/in_progress/i)).toBeInTheDocument();
  });
});
