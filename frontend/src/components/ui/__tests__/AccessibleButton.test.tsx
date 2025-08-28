import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import AccessibleButton from '../AccessibleButton';
import { Play } from 'lucide-react';

describe('AccessibleButton', () => {
  it('renders with correct text', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(
      <AccessibleButton loading loadingText="Processing...">
        Submit
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('prevents click when disabled', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleButton disabled onClick={handleClick}>
        Disabled
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icon in correct position', () => {
    render(
      <AccessibleButton icon={<Play data-testid="play-icon" />} iconPosition="left">
        Play
      </AccessibleButton>
    );
    
    const icon = screen.getByTestId('play-icon');
    const button = screen.getByRole('button');
    
    expect(button).toContainElement(icon);
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
    
    rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('supports full width prop', () => {
    render(<AccessibleButton fullWidth>Full Width</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('announces to screen reader when specified', async () => {
    const announceMessage = 'Action completed';
    render(
      <AccessibleButton announceOnClick={announceMessage}>
        Click me
      </AccessibleButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for screen reader announcement
    await waitFor(() => {
      const announcer = document.querySelector('[aria-live]');
      expect(announcer).toHaveTextContent(announceMessage);
    }, { timeout: 200 });
  });

  it('meets accessibility standards', () => {
    render(<AccessibleButton>Accessible Button</AccessibleButton>);
    const button = screen.getByRole('button');
    
    // Should be keyboard accessible
    expect(button).toHaveAttribute('tabindex', '0');
    
    // Should have proper focus management
    button.focus();
    expect(button).toHaveFocus();
    
    // Should support keyboard activation
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });
  });

  it('has minimum touch target size', () => {
    render(<AccessibleButton size="sm">Small</AccessibleButton>);
    const button = screen.getByRole('button');
    
    const styles = window.getComputedStyle(button);
    const minHeight = parseInt(styles.minHeight);
    const minWidth = parseInt(styles.minWidth);
    
    expect(minHeight).toBeGreaterThanOrEqual(44);
    expect(minWidth).toBeGreaterThanOrEqual(44);
  });
});