import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Layout from '../shared/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from '../core/realtime/SocketProvider';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import type { AxeResults, Result } from 'axe-core';

// Basic accessibility smoke test for Layout shell
// More granular tests will be added per feature later (modals, forms, drag-drop)

test('layout has no critical accessibility violations', async () => {
  const qc = new QueryClient();
  const { container } = render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <SocketProvider enable={false}>
          <Layout />
        </SocketProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
  const results: AxeResults = await axe(container, { rules: { 'color-contrast': { enabled: true } } });
  // allow minor warnings early; focus on serious/critical
  const serious = results.violations.filter((v: Result) => ['serious','critical'].includes(v.impact || ''));
  expect(serious.map((v: Result)=>v.id)).toEqual([]);
});
