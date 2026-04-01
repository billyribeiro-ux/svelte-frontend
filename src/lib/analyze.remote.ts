import * as v from 'valibot';
import { query } from '$app/server';

interface AnalysisIssue {
	type: 'warning' | 'suggestion';
	message: string;
	pattern: string;
}

interface AnalysisResult {
	issues: AnalysisIssue[];
	suggestions: string[];
}

export const analyzeCode = query(v.string(), async (code): Promise<AnalysisResult> => {
	const issues: AnalysisIssue[] = [];
	const suggestions: string[] = [];

	if (code.includes('export let ')) {
		issues.push({ type: 'warning', message: 'Use `$props()` instead of `export let` (Svelte 5).', pattern: 'export let' });
		suggestions.push('Replace `export let prop` with `let { prop } = $props()`');
	}

	if (/\$:\s/.test(code)) {
		issues.push({ type: 'warning', message: 'Use `$derived` or `$effect` instead of `$:` (Svelte 5).', pattern: '$:' });
		suggestions.push('Replace `$: value = expr` with `let value = $derived(expr)`');
	}

	if (code.includes('<slot')) {
		issues.push({ type: 'warning', message: 'Use `{#snippet}` and `{@render}` instead of `<slot>` (Svelte 5).', pattern: '<slot' });
		suggestions.push('Replace `<slot />` with `{@render children()}`');
	}

	if (code.includes('createEventDispatcher')) {
		issues.push({ type: 'warning', message: 'Use callback props instead of `createEventDispatcher` (Svelte 5).', pattern: 'createEventDispatcher' });
		suggestions.push('Pass functions as props: `let { onclick } = $props()`');
	}

	if (code.includes('onMount') || code.includes('onDestroy')) {
		issues.push({ type: 'suggestion', message: 'Consider `$effect` with cleanup instead of `onMount`/`onDestroy`.', pattern: 'onMount/onDestroy' });
	}

	return { issues, suggestions };
});
