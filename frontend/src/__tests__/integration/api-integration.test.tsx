import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock the API service
vi.mock('../../services/api');

// Create a test component that uses API
const TestApiComponent = () => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const { apiFetch } = await import('../../services/api');
      const response = await apiFetch('/api/test');
      setData(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleFetch}>Fetch Data</button>
      {loading && <div data-testid="loading">Loading...</div>}
      {data && <div data-testid="data">{JSON.stringify(data)}</div>}
      {error && <div data-testid="error">{error}</div>}
    </div>
  );
};

describe('Frontend-Backend Integration', () => {
  let mockApiFetch: any;
  let queryClient: QueryClient;

  beforeEach(async () => {
    const apiModule = await import('../../services/api');
    mockApiFetch = vi.mocked(apiModule.apiFetch);
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  it('handles successful API requests', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true, data: 'test response' });

    renderWithProviders(<TestApiComponent />);
    
    fireEvent.click(screen.getByText('Fetch Data'));
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('data')).toHaveTextContent('{"success":true,"data":"test response"}');
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { ApiError } = await import('../../services/api');
    mockApiFetch.mockRejectedValueOnce(new ApiError('Server error', 500));

    renderWithProviders(<TestApiComponent />);
    
    fireEvent.click(screen.getByText('Fetch Data'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Server error');
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
  });

  it('handles network errors', async () => {
    const { ApiError } = await import('../../services/api');
    mockApiFetch.mockRejectedValueOnce(new ApiError('Network error', 0));

    renderWithProviders(<TestApiComponent />);
    
    fireEvent.click(screen.getByText('Fetch Data'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Network error');
  });

  describe('Projects API Integration', () => {
    it('creates a new project successfully', async () => {
      const newProject = { id: '1', name: 'Test Project', status: 'todo' };
      mockApiFetch.mockResolvedValueOnce({ project: newProject });

      const CreateProjectComponent = () => {
        const [project, setProject] = React.useState<any>(null);
        
        const handleCreate = async () => {
          const { createProject } = await import('../../services/api');
          const response = await createProject({ name: 'Test Project', status: 'todo' });
          setProject(response.project);
        };

        return (
          <div>
            <button onClick={handleCreate}>Create Project</button>
            {project && (
              <div data-testid="created-project">
                {project.name} - {project.status}
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<CreateProjectComponent />);
      
      fireEvent.click(screen.getByText('Create Project'));
      
      await waitFor(() => {
        expect(screen.getByTestId('created-project')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('created-project')).toHaveTextContent('Test Project - todo');
      expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project', status: 'todo' })
      });
    });

    it('lists projects successfully', async () => {
      const projects = [
        { id: '1', name: 'Project 1', status: 'todo' },
        { id: '2', name: 'Project 2', status: 'in_progress' }
      ];
      mockApiFetch.mockResolvedValueOnce({ projects });

      const ListProjectsComponent = () => {
        const [projects, setProjects] = React.useState<any[]>([]);
        
        const handleList = async () => {
          const { listProjects } = await import('../../services/api');
          const response = await listProjects();
          setProjects(response.projects);
        };

        return (
          <div>
            <button onClick={handleList}>List Projects</button>
            <div data-testid="projects-list">
              {projects.map(project => (
                <div key={project.id} data-testid={`project-${project.id}`}>
                  {project.name} - {project.status}
                </div>
              ))}
            </div>
          </div>
        );
      };

      renderWithProviders(<ListProjectsComponent />);
      
      fireEvent.click(screen.getByText('List Projects'));
      
      await waitFor(() => {
        expect(screen.getByTestId('project-1')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('project-1')).toHaveTextContent('Project 1 - todo');
      expect(screen.getByTestId('project-2')).toHaveTextContent('Project 2 - in_progress');
      expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/projects');
    });

    it('updates a project successfully', async () => {
      const updatedProject = { id: '1', name: 'Updated Project', status: 'in_progress' };
      mockApiFetch.mockResolvedValueOnce({ project: updatedProject });

      const UpdateProjectComponent = () => {
        const [project, setProject] = React.useState<any>(null);
        
        const handleUpdate = async () => {
          const { updateProject } = await import('../../services/api');
          const response = await updateProject('1', { name: 'Updated Project', status: 'in_progress' });
          setProject(response.project);
        };

        return (
          <div>
            <button onClick={handleUpdate}>Update Project</button>
            {project && (
              <div data-testid="updated-project">
                {project.name} - {project.status}
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<UpdateProjectComponent />);
      
      fireEvent.click(screen.getByText('Update Project'));
      
      await waitFor(() => {
        expect(screen.getByTestId('updated-project')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('updated-project')).toHaveTextContent('Updated Project - in_progress');
      expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/projects/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Project', status: 'in_progress' })
      });
    });
  });

  describe('Authentication Flow Integration', () => {
    it('handles login flow successfully', async () => {
      const loginResponse = { token: 'jwt-token', user: { id: '1', email: 'test@example.com' } };
      mockApiFetch.mockResolvedValueOnce(loginResponse);

      const LoginComponent = () => {
        const [user, setUser] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(false);
        
        const handleLogin = async () => {
          setLoading(true);
          try {
            const { login } = await import('../../services/api');
            const response = await login('test@example.com', 'password');
            setUser(response.user);
          } finally {
            setLoading(false);
          }
        };

        return (
          <div>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {user && (
              <div data-testid="logged-in-user">
                Welcome, {user.email}!
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<LoginComponent />);
      
      fireEvent.click(screen.getByText('Login'));
      
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('logged-in-user')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('logged-in-user')).toHaveTextContent('Welcome, test@example.com!');
      expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });
    });

    it('handles login failure', async () => {
      const { ApiError } = await import('../../services/api');
      mockApiFetch.mockRejectedValueOnce(new ApiError('Invalid credentials', 401));

      const LoginComponent = () => {
        const [error, setError] = React.useState<string | null>(null);
        
        const handleLogin = async () => {
          try {
            const { login } = await import('../../services/api');
            await login('test@example.com', 'wrongpassword');
          } catch (err: any) {
            setError(err.message);
          }
        };

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            {error && (
              <div data-testid="login-error" role="alert">
                {error}
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<LoginComponent />);
      
      fireEvent.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid credentials');
    });
  });
});