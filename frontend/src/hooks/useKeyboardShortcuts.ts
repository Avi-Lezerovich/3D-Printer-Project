import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function useControlPanelShortcuts(
  onRefresh: () => void,
  onToggleConnection: () => void,
  onEmergencyStop: () => void,
  onTabChange: (tabId: string) => void
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        onRefresh();
      },
      description: 'Refresh connection and data',
      category: 'General'
    },
    {
      key: 'c',
      ctrlKey: true,
      altKey: true,
      action: onToggleConnection,
      description: 'Toggle printer connection',
      category: 'Connection'
    },
    {
      key: 'Escape',
      action: onEmergencyStop,
      description: 'Emergency stop',
      category: 'Safety'
    },
    {
      key: '1',
      altKey: true,
      action: () => onTabChange('overview'),
      description: 'Switch to Dashboard tab',
      category: 'Navigation'
    },
    {
      key: '2',
      altKey: true,
      action: () => onTabChange('controls'),
      description: 'Switch to Controls tab',
      category: 'Navigation'
    },
    {
      key: '3',
      altKey: true,
      action: () => onTabChange('monitor'),
      description: 'Switch to Live View tab',
      category: 'Navigation'
    },
    {
      key: '4',
      altKey: true,
      action: () => onTabChange('charts'),
      description: 'Switch to Analytics tab',
      category: 'Navigation'
    },
    {
      key: '5',
      altKey: true,
      action: () => onTabChange('files'),
      description: 'Switch to Files tab',
      category: 'Navigation'
    },
    {
      key: '6',
      altKey: true,
      action: () => onTabChange('queue'),
      description: 'Switch to Queue tab',
      category: 'Navigation'
    },
    {
      key: '/',
      action: () => {
        // Focus search if available, or show help
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search field',
      category: 'Navigation'
    },
    {
      key: '?',
      action: () => {
        // This will be handled by the parent component
        document.dispatchEvent(new CustomEvent('showKeyboardHelp'));
      },
      description: 'Show keyboard shortcuts help',
      category: 'Help'
    }
  ];

  useKeyboardShortcuts(shortcuts, true);

  return { shortcuts };
}