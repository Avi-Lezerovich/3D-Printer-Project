import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppQueryProvider } from '../core/query/QueryProvider';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

// Mock utilities
export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
  
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
};

export const createMockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });
};

export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  return localStorageMock;
};

export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Accessibility testing helpers
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received) {
      const pass = received.violations.length === 0;
      const message = () =>
        pass
          ? 'Expected accessibility violations, but none were found'
          : `Expected no accessibility violations, but found:\n${received.violations
              .map((v: any) => `- ${v.description}`)
              .join('\n')}`;
      
      return { pass, message };
    }
  }).toHaveNoViolations,
};

// User event helpers with accessibility considerations
export const createAccessibleUserEvent = () => ({
  // Tab navigation testing
  tabToElement: async (element: HTMLElement) => {
    element.focus();
    expect(element).toHaveFocus();
  },
  
  // Screen reader announcement verification
  expectAnnouncement: (message: string, timeout = 1000) => {
    return new Promise((resolve) => {
      const announcer = document.querySelector('[aria-live]');
      if (announcer) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              if (announcer.textContent?.includes(message)) {
                observer.disconnect();
                resolve(true);
              }
            }
          });
        });
        
        observer.observe(announcer, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, timeout);
      } else {
        resolve(false);
      }
    });
  }
});

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => Promise<void>) => {
  const start = performance.now();
  await renderFn();
  const end = performance.now();
  return end - start;
};

export const expectRenderTimeUnder = (threshold: number) => ({
  async toRenderUnder(renderFn: () => Promise<void>) {
    const renderTime = await measureRenderTime(renderFn);
    expect(renderTime).toBeLessThan(threshold);
    return renderTime;
  }
});