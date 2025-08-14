import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from '../../components/Modal';

describe('Modal', () => {
  it('focuses first button', async () => {
    const onClose = vi.fn();
    render(<Modal open title="Test" onClose={onClose}><button>First</button><button>Second</button></Modal>);
    await waitFor(() => expect(screen.getByText('First')).toHaveFocus());
  });
  it('escape closes modal', () => {
    const onClose = vi.fn();
    render(<Modal open title="Esc" onClose={onClose}><button>Inside</button></Modal>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
