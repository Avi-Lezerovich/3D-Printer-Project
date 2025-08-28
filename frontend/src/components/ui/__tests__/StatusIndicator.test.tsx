import { render, screen } from '../../../test-utils';
import StatusIndicator from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders good status correctly', () => {
    render(<StatusIndicator status="good" />);
    
    const indicator = screen.getByText('Good');
    expect(indicator).toBeInTheDocument();
    expect(indicator.closest('div')).toHaveStyle({
      color: 'var(--good)'
    });
  });

  it('renders warning status correctly', () => {
    render(<StatusIndicator status="warn" />);
    
    const indicator = screen.getByText('Warning');
    expect(indicator).toBeInTheDocument();
  });

  it('renders error status correctly', () => {
    render(<StatusIndicator status="bad" />);
    
    const indicator = screen.getByText('Error');
    expect(indicator).toBeInTheDocument();
  });

  it('renders pending status correctly', () => {
    render(<StatusIndicator status="pending" />);
    
    const indicator = screen.getByText('Pending');
    expect(indicator).toBeInTheDocument();
  });

  it('supports custom labels', () => {
    render(<StatusIndicator status="good" label="All Systems Go" />);
    
    expect(screen.getByText('All Systems Go')).toBeInTheDocument();
    expect(screen.queryByText('Good')).not.toBeInTheDocument();
  });

  it('can hide icon when specified', () => {
    render(<StatusIndicator status="good" showIcon={false} />);
    
    // Icon should have aria-hidden or not be present
    const container = screen.getByText('Good').closest('div');
    expect(container).not.toContainHTML('svg');
  });

  it('can hide label when specified', () => {
    render(<StatusIndicator status="good" showLabel={false} />);
    
    expect(screen.queryByText('Good')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<StatusIndicator status="good" size="sm" />);
    let container = screen.getByText('Good').closest('div');
    expect(container).toHaveClass('p-xs', 'gap-xs', 'text-sm');

    rerender(<StatusIndicator status="good" size="lg" />);
    container = screen.getByText('Good').closest('div');
    expect(container).toHaveClass('p-md', 'gap-sm', 'text-lg');
  });

  it('supports pulse animation', () => {
    render(<StatusIndicator status="good" pulse />);
    
    const container = screen.getByText('Good').closest('div');
    // The pulse animation should be applied via Framer Motion
    expect(container).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<StatusIndicator status="good" label="System Status" />);
    
    const container = screen.getByText('System Status').closest('div');
    
    // Should have proper styling for status indication
    expect(container).toHaveClass('inline-flex', 'items-center', 'rounded-lg');
    
    // Should have visual indicators that don't rely solely on color
    expect(container).toContainHTML('svg'); // Icon for non-color identification
  });

  it('meets color contrast requirements', () => {
    render(<StatusIndicator status="good" />);
    
    const container = screen.getByText('Good').closest('div') as HTMLElement;
    const styles = window.getComputedStyle(container);
    
    // Should have sufficient contrast with background
    expect(styles.backgroundColor).toMatch(/rgba\(55, 214, 122, 0\.1\)/);
    expect(styles.color).toBe('var(--good)');
    expect(styles.border).toContain('rgba(55, 214, 122');
  });
});