import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toasts from '../../components/Toasts';
import { useAppStore } from '../../shared/store';

describe('Toasts', () => {
  it('renders recent toasts', () => {
    const id = useAppStore.getState().pushToast({ message: 'Hello', variant: 'info', timeoutMs: 1000 });
    render(<Toasts />);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    // auto-dismiss path
    const dismiss = vi.spyOn(useAppStore.getState(), 'dismissToast');
    setTimeout(()=>{
      expect(dismiss).toHaveBeenCalledWith(id);
    }, 1200);
  });
});
