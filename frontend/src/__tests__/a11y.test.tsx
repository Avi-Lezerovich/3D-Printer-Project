import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import App from '../shared/Layout';
import { axe } from 'jest-axe';

// Basic accessibility smoke test for Layout shell
// More granular tests will be added per feature later (modals, forms, drag-drop)

test('layout has no critical accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container, { rules: { 'color-contrast': { enabled: true } } });
  // allow minor warnings early; focus on serious/critical
  const serious = results.violations.filter(v => ['serious','critical'].includes(v.impact || ''));
  expect(serious.map(v=>v.id)).toEqual([]);
});
