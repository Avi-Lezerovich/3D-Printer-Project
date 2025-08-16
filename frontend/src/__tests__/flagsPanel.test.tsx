import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FlagsPanel } from '../features/flags/FlagsPanel';

vi.mock('../core/api/client', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ flags: { realtime: true, audit: false } }))
  }
}));

describe('FlagsPanel', () => {
  it('renders flags after fetch', async () => {
    render(<FlagsPanel />);
    await waitFor(()=> screen.getByText(/realtime/i));
    expect(screen.getByText(/realtime/i)).toBeInTheDocument();
  });
});
