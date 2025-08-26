import '@testing-library/jest-dom/vitest'
import React from 'react'

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

// Mock WebGL and Three.js related global objects
(global as any).HTMLCanvasElement = class HTMLCanvasElement extends HTMLElement {
	constructor() { super(); }
	getContext() { return mockCanvasCtx; }
	toDataURL() { return ''; }
};

// Mock WebGL context
(global as any).WebGLRenderingContext = class WebGLRenderingContext {};
(global as any).WebGL2RenderingContext = class WebGL2RenderingContext {};

// Mock @react-three/fiber Canvas and Three.js components
const mockThreeComponents = {
	Canvas: function MockCanvas({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
		return React.createElement('div', { 'data-testid': 'mock-canvas', ...props }, children);
	},
	Mesh: function MockMesh({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
		return React.createElement('div', { 'data-testid': 'mock-mesh', ...props }, children);
	},
	Box: function MockBox(props: Record<string, unknown>) {
		return React.createElement('div', { 'data-testid': 'mock-box', ...props });
	},
	Sphere: function MockSphere(props: Record<string, unknown>) {
		return React.createElement('div', { 'data-testid': 'mock-sphere', ...props });
	},
};

// Apply mocks globally
(global as any).Canvas = mockThreeComponents.Canvas;
(global as any).Mesh = mockThreeComponents.Mesh;
(global as any).Box = mockThreeComponents.Box;
(global as any).Sphere = mockThreeComponents.Sphere;

// Provide minimal 2d context; ignore contextId differences
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	configurable: true,
	writable: true,
	value: () => mockCanvasCtx as unknown as CanvasRenderingContext2D,
});

// NOTE: matchMedia is automatically polyfilled by default in jsdom but might need this for various other tests
Object.defineProperty(window, 'matchMedia', {
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => {},
	}),
	writable: true,
})

// Mock requestAnimationFrame (some libraries depend on it)
// https://github.com/jsdom/jsdom/issues/2527
window.requestAnimationFrame = (callback: FrameRequestCallback) => {
	// Simulate animation frame at 60fps (16.67ms delay)
	return setTimeout(callback, 16)
}

window.cancelAnimationFrame = (id: number) => {
	clearTimeout(id)
}

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
