import '@testing-library/jest-dom';
import { createMockIntersectionObserver, createMockResizeObserver, mockMatchMedia } from './index';

// Mock APIs that are not available in jsdom
createMockIntersectionObserver();
createMockResizeObserver();
mockMatchMedia();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock window.performance.memory
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1048576,
    totalJSHeapSize: 2097152,
    jsHeapSizeLimit: 4194304
  }
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  }
}));

// Mock CSS custom properties
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element: Element) => {
  const style = originalGetComputedStyle(element);
  
  // Mock CSS custom properties
  const mockStyle = {
    ...style,
    getPropertyValue: (prop: string) => {
      const mockValues: Record<string, string> = {
        '--accent': '#00aef0',
        '--bg': '#0b1620',
        '--text': '#e6f1ff',
        '--border': '#123a56',
        '--good': '#37d67a',
        '--warn': '#f5a623',
        '--bad': '#f44336'
      };
      
      return mockValues[prop] || style.getPropertyValue(prop);
    }
  };
  
  return mockStyle as CSSStyleDeclaration;
};