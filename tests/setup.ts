import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

afterEach(() => {
	cleanup();
	localStorage.clear();
});

// Stub window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	configurable: true,
	value: (query: string) => ({
		matches: false,
		media: query ?? '',
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})
});

// Stub ResizeObserver
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// Stub IntersectionObserver
class IntersectionObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = ResizeObserverStub;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = IntersectionObserverStub;
