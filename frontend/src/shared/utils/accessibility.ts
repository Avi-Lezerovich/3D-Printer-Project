// Screen reader utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('class', 'visually-hidden');
  
  document.body.appendChild(announcer);
  
  // Small delay to ensure screen readers pick it up
  setTimeout(() => {
    announcer.textContent = message;
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, 100);
};

// Focus management utilities
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Keyboard navigation helpers
export const handleArrowNavigation = (
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void,
  orientation: 'horizontal' | 'vertical' | 'both' = 'both'
) => {
  const { key } = event;
  let newIndex = currentIndex;
  
  switch (key) {
    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      break;
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
      break;
    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      break;
    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
  }
  
  if (newIndex !== currentIndex) {
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
};

// Color contrast utilities
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const getRGB = (val: number) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsContrastRequirement = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
};

// ARIA utilities
export const generateUniqueId = (prefix = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const setAriaAttributes = (
  element: HTMLElement,
  attributes: Record<string, string | boolean | number>
) => {
  Object.entries(attributes).forEach(([key, value]) => {
    const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
    element.setAttribute(ariaKey, String(value));
  });
};

// Reduced motion preferences
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// High contrast mode detection
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Font size preference detection
export const getPreferredFontSize = (): 'small' | 'medium' | 'large' => {
  const fontSize = window.getComputedStyle(document.documentElement).fontSize;
  const baseFontSize = parseFloat(fontSize);
  
  if (baseFontSize >= 20) return 'large';
  if (baseFontSize >= 18) return 'medium';
  return 'small';
};

// Skip link utilities
export const createSkipLink = (targetId: string, text = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link visually-hidden';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--accent);
    color: white;
    padding: 8px;
    border-radius: 4px;
    z-index: 9999;
    text-decoration: none;
    transition: top 0.2s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  return skipLink;
};