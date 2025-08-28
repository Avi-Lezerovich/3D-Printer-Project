import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts, KeyboardShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockAction: jest.Mock;
  let shortcuts: KeyboardShortcut[];

  beforeEach(() => {
    mockAction = jest.fn();
    shortcuts = [
      {
        key: 'k',
        ctrlKey: true,
        action: mockAction,
        description: 'Search',
        category: 'Navigation'
      },
      {
        key: 'Escape',
        action: mockAction,
        description: 'Close',
        category: 'General'
      }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('triggers action when correct key combination is pressed', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('triggers action for simple key press', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Simulate Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when wrong modifier is pressed', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Simulate just 'k' without Ctrl
    fireEvent.keyDown(document, { key: 'k' });
    expect(mockAction).not.toHaveBeenCalled();

    // Simulate 'k' with Alt instead of Ctrl
    fireEvent.keyDown(document, { key: 'k', altKey: true });
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when disabled', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts, false));

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when typing in input fields', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts(shortcuts));

    fireEvent.keyDown(input, { key: 'k', ctrlKey: true });
    expect(mockAction).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('ignores shortcuts when typing in textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    renderHook(() => useKeyboardShortcuts(shortcuts));

    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
    expect(mockAction).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('ignores shortcuts in contentEditable elements', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    div.focus();

    renderHook(() => useKeyboardShortcuts(shortcuts));

    fireEvent.keyDown(div, { key: 'k', ctrlKey: true });
    expect(mockAction).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('prevents default behavior when shortcut is triggered', () => {
    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { 
      key: 'k', 
      ctrlKey: true,
      cancelable: true 
    });
    
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    document.dispatchEvent(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalled();
  });

  it('handles multiple shortcuts correctly', () => {
    const secondAction = jest.fn();
    const multipleShortcuts = [
      ...shortcuts,
      {
        key: 'n',
        ctrlKey: true,
        action: secondAction,
        description: 'New',
        category: 'File'
      }
    ];

    renderHook(() => useKeyboardShortcuts(multipleShortcuts));

    // Trigger first shortcut
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(secondAction).not.toHaveBeenCalled();

    // Trigger second shortcut
    fireEvent.keyDown(document, { key: 'n', ctrlKey: true });
    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(secondAction).toHaveBeenCalledTimes(1);
  });

  it('removes event listener on cleanup', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});