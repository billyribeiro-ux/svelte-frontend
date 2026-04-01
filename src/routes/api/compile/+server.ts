import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { code } = await request.json();

	// Server-side compilation fallback
	// In Phase 1, compilation happens client-side
	// This endpoint exists as a backup for complex scenarios
	try {
		const { compile } = await import('svelte/compiler');
		const result = compile(code, {
			filename: 'App.svelte',
			generate: 'client',
			dev: true,
			css: 'injected',
			runes: true
		});

		return json({
			success: true,
			js: result.js.code,
			css: result.css?.code ?? null,
			warnings: result.warnings
		});
	} catch (err) {
		return json({
			success: false,
			error: err instanceof Error ? err.message : 'Compilation failed'
		});
	}
};
