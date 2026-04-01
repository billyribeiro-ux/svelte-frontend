import type { ConsoleEntry } from '$types/editor';

let counter = 0;

/**
 * Creates a unique ID for a console entry.
 */
export function createConsoleId(): string {
	return `console-${++counter}-${Date.now()}`;
}

/**
 * Formats a single console argument for display.
 * Handles objects, arrays, undefined, null, and primitives.
 */
export function formatConsoleArg(arg: unknown): string {
	if (arg === undefined) return 'undefined';
	if (arg === null) return 'null';

	if (typeof arg === 'string') return arg;

	if (typeof arg === 'object') {
		try {
			return JSON.stringify(arg, null, 2);
		} catch {
			return String(arg);
		}
	}

	return String(arg);
}

/**
 * Formats an array of console arguments into display-ready strings.
 */
export function formatConsoleArgs(args: unknown[]): string[] {
	return args.map(formatConsoleArg);
}

/**
 * Creates a ConsoleEntry from raw console arguments.
 */
export function createConsoleEntry(
	method: ConsoleEntry['method'],
	args: unknown[]
): ConsoleEntry {
	return {
		id: createConsoleId(),
		method,
		args: formatConsoleArgs(args),
		timestamp: Date.now()
	};
}
