import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';

// Mock console.error to prevent error logs in test output
const originalConsoleError = console.error;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="working-component">Working component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Mock console.error to prevent error logs during tests
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  it('renders children when there is no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry for the inconvenience/)).toBeInTheDocument();
    expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
  });

  it('logs error to console when an error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('provides a link to homepage when error occurs', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeLink = screen.getByText('Go to Homepage');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('has proper error boundary container class', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const container = screen.getByText('Something went wrong.').closest('div');
    expect(container).toHaveClass('error-boundary-container');
  });

  it('recovers from error state when children change', () => {
    const TestComponent = ({ hasError }: { hasError: boolean }) => (
      <MemoryRouter>
        <ErrorBoundary>
          {hasError ? <ThrowError shouldThrow={true} /> : <ThrowError shouldThrow={false} />}
        </ErrorBoundary>
      </MemoryRouter>
    );

    const { rerender } = render(<TestComponent hasError={true} />);

    // Should show error UI
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();

    // Re-render with working component
    rerender(<TestComponent hasError={false} />);

    // Should still show error UI since error boundary doesn't automatically recover
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    renderWithRouter(
      <ErrorBoundary>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });

  it('catches errors from any child component', () => {
    const AnotherErrorComponent = () => {
      throw new Error('Another test error');
    };

    renderWithRouter(
      <ErrorBoundary>
        <div>Some content</div>
        <AnotherErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('works with nested error boundaries', () => {
    const NestedErrorComponent = () => {
      throw new Error('Nested error');
    };

    renderWithRouter(
      <ErrorBoundary>
        <div>Outer content</div>
        <ErrorBoundary>
          <NestedErrorComponent />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // The inner error boundary should catch the error
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    // The outer content should not be visible because the inner error bubbled up
  });

  it('handles errors in event handlers gracefully', () => {
    // Note: Error boundaries don't catch errors in event handlers
    // This test demonstrates that the boundary continues to work normally
    const ComponentWithEventHandler = () => (
      <button
        onClick={() => {
          // This error won't be caught by ErrorBoundary
          throw new Error('Event handler error');
        }}
      >
        Click me
      </button>
    );

    renderWithRouter(
      <ErrorBoundary>
        <ComponentWithEventHandler />
      </ErrorBoundary>
    );

    // Component should render normally
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle production logging differently', () => {
      process.env.NODE_ENV = 'production';
      
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // In production, it should still show the error UI
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      
      // The console.error should still be called for logging
      expect(console.error).toHaveBeenCalled();
    });
  });
});