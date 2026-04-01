import { compile } from 'svelte/compiler';
import type {
	CompilationResult,
	CompilationMetadata,
	CompileWarning,
	CompileError
} from '$types/editor';

const RUNE_PATTERNS = [
	'$state',
	'$state.raw',
	'$derived',
	'$derived.by',
	'$effect',
	'$effect.pre',
	'$effect.root',
	'$props',
	'$bindable',
	'$inspect',
	'$host'
] as const;

function extractMetadata(source: string, ast: unknown): CompilationMetadata {
	const runes: string[] = [];
	for (const rune of RUNE_PATTERNS) {
		const escaped = rune.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const pattern = new RegExp(`\\b${escaped}\\b`);
		if (pattern.test(source)) {
			runes.push(rune);
		}
	}

	const bindings: string[] = [];
	const bindPattern = /bind:(\w+)/g;
	let match: RegExpExecArray | null;
	while ((match = bindPattern.exec(source)) !== null) {
		if (match[1] && !bindings.includes(match[1])) {
			bindings.push(match[1]);
		}
	}

	const dependencies: string[] = [];
	const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
	while ((match = importPattern.exec(source)) !== null) {
		if (match[1]) dependencies.push(match[1]);
	}

	return { runes, bindings, dependencies };
}

function normalizeWarning(warning: Record<string, unknown>): CompileWarning {
	return {
		message: String(warning.message ?? ''),
		code: String(warning.code ?? ''),
		start: warning.start as CompileWarning['start'],
		end: warning.end as CompileWarning['end']
	};
}

function normalizeError(error: unknown): CompileError {
	if (error instanceof Error) {
		const svelteError = error as Error & {
			code?: string;
			start?: { line: number; column: number };
			end?: { line: number; column: number };
		};
		return {
			message: svelteError.message,
			code: svelteError.code,
			start: svelteError.start,
			end: svelteError.end,
			stack: svelteError.stack
		};
	}
	return {
		message: String(error),
		stack: undefined
	};
}

export function compileSvelte(
	source: string,
	filename: string = 'App.svelte'
): CompilationResult {
	try {
		const result = compile(source, {
			filename,
			generate: 'client',
			dev: true,
			css: 'injected',
			runes: true
		});

		const ast = result.ast ?? null;
		const metadata = extractMetadata(source, ast);

		const warnings: CompileWarning[] = (result.warnings ?? []).map((w: Record<string, unknown>) =>
			normalizeWarning(w)
		);

		return {
			success: true,
			js: result.js?.code ?? null,
			css: result.css?.code ?? null,
			warnings,
			errors: [],
			ast,
			metadata
		};
	} catch (error: unknown) {
		return {
			success: false,
			js: null,
			css: null,
			warnings: [],
			errors: [normalizeError(error)],
			ast: null,
			metadata: { runes: [], bindings: [], dependencies: [] }
		};
	}
}
