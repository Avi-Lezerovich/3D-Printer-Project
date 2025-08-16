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

// Always override canvas getContext (jsdom throws Not implemented by default)
const mockCanvasCtx = {
	canvas: null,
	fillRect() {},
	clearRect() {},
	getImageData: () => ({ data: [] }),
	putImageData() {},
	createImageData: () => ({}),
	setTransform() {},
	drawImage() {},
	save() {},
	restore() {},
	beginPath() {},
	closePath() {},
	stroke() {},
	fill() {},
	measureText: () => ({ width: 0 }),
	translate() {},
	scale() {},
	rotate() {},
	arc() {},
	fillText() {},
} as const
// Provide minimal 2d context; ignore contextId differences
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	configurable: true,
	writable: true,
	value: () => mockCanvasCtx as unknown as CanvasRenderingContext2D,
})

// Suppress noisy React Router future flag warnings in tests
const rrMarkers = ['React Router Future Flag Warning']
const origWarn = console.warn
const origError = console.error
function shouldSilence(msg: unknown) {
	return typeof msg === 'string' && rrMarkers.some(m => msg.includes(m))
}
console.warn = (...args: unknown[]) => {
	if (shouldSilence(args[0])) return
	origWarn(...args)
}
console.error = (...args: unknown[]) => {
	if (shouldSilence(args[0])) return
	origError(...args)
}
