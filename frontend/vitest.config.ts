import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts'],
		globals: true,
		include: ['src/**/*.{test,spec}.tsx'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'**/*.d.ts',
				'**/*.{test,spec}.*',
				'node_modules/**',
				'dist/**',
				'dist-server/**',
				'public/**',
				'vite.config.*',
				'vitest.config.*',
				'tsconfig.*',
			],
		},
	},
})
