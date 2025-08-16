import '@testing-library/jest-dom/vitest'
// JSDOM setup for React tests
// Polyfill ResizeObserver for components relying on it
if (typeof (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
	class RO {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	;(globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver = RO
}

if (typeof (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver === 'undefined') {
	class IO {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() { return [] }
		root: Element | null = null
		rootMargin = '0px'
		thresholds: ReadonlyArray<number> = [0]
	}
	;(globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver = IO as unknown
}
