import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default dark theme when no theme in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<ThemeToggle />);
    
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
  });

  it('renders with light theme when stored in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    expect(screen.getByText('☀️ Light')).toBeInTheDocument();
  });

  it('renders with dark theme when stored in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
  });

  it('sets document attribute on initial render', () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('saves theme to localStorage on initial render', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles from dark to light when clicked', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    
    expect(screen.getByText('☀️ Light')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('toggles from light to dark when clicked', () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    expect(screen.getByText('☀️ Light')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles multiple times correctly', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<ThemeToggle />);
    
    const button = screen.getByLabelText('Toggle theme');
    
    // Start with dark
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
    
    // Toggle to light
    fireEvent.click(button);
    expect(screen.getByText('☀️ Light')).toBeInTheDocument();
    
    // Toggle back to dark
    fireEvent.click(button);
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
    
    // Toggle to light again
    fireEvent.click(button);
    expect(screen.getByText('☀️ Light')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    expect(button).toHaveClass('btn');
  });
});