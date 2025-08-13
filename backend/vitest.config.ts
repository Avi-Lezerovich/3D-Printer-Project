import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.{test,spec}.*',
        'node_modules/**',
        'dist/**',
      ],
    },
  },
})
