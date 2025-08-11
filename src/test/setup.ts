// JSDOM setup for React tests
// Polyfill ResizeObserver for components relying on it
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
	class RO {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	;(globalThis as any).ResizeObserver = RO
}

if (typeof (globalThis as any).IntersectionObserver === 'undefined') {
	class IO {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() { return [] }
		root: Element | null = null
		rootMargin = '0px'
		thresholds: ReadonlyArray<number> = [0]
	}
	;(globalThis as any).IntersectionObserver = IO as any
}
