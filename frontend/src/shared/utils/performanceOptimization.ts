import { lazy } from 'react';

// Utility for creating preloaded lazy components
export const createPreloadableLazy = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  preload = false
) => {
  const LazyComponent = lazy(importFn);
  
  // Optionally preload the component
  if (preload) {
    importFn();
  }
  
  // Attach preload function to component
  (LazyComponent as React.ComponentType & { preload: () => Promise<unknown> }).preload = importFn;
  
  return LazyComponent;
};

// Image optimization utilities
export const getOptimizedImageSrc = (
  src: string
): string => {
  // In a real app, this would generate URLs for a CDN like Cloudinary or imgix
  // For now, just return the original src
  return src;
};

export const createImageSrcSet = (
  src: string, 
  widths: number[] = [320, 640, 960, 1280]
): string => {
  return widths
    .map(width => `${getOptimizedImageSrc(src, width)} ${width}w`)
    .join(', ');
};

// Debounce utility for performance-critical operations
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for scroll/resize handlers
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
): { startIndex: number; endIndex: number; } => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1, 
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};

// Memory usage monitoring
export const measureMemoryUsage = (): Promise<number> => {
  return new Promise((resolve) => {
    if ('memory' in performance) {
      // @ts-expect-error - performance.memory is not in all browsers
      resolve(performance.memory.usedJSHeapSize / 1048576); // MB
    } else {
      resolve(0);
    }
  });
};

// Bundle analysis utilities
export const logBundleSize = () => {
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/critical.css';
  document.head.appendChild(link);

  // Preload web fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(fontLink);
};