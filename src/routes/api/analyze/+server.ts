import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { code } = await request.json();

	// Phase 1 stub — basic analysis
	const issues: Array<{ severity: string; message: string }> = [];

	if (code.includes('export let ')) {
		issues.push({
			severity: 'warning',
			message: 'Use $props() instead of "export let" in Svelte 5'
		});
	}

	if (code.includes('$:')) {
		issues.push({
			severity: 'warning',
			message: 'Use $derived or $effect instead of reactive statements ($:) in Svelte 5'
		});
	}

	if (code.includes('<slot')) {
		issues.push({
			severity: 'info',
			message: 'Consider using {#snippet} and {@render} instead of <slot> in Svelte 5'
		});
	}

	return json({ issues, suggestions: [] });
};
