import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();

	// Phase 1 stub — return a mock tutor response
	const responses = [
		"That's a great question! In Svelte 5, runes like `$state` make reactivity explicit. Try wrapping your variable declaration with `$state()` to make it reactive.",
		"Looking at your code, I can see you're on the right track. Remember that `$derived` automatically tracks its dependencies — any `$state` value used inside the expression will trigger a recalculation.",
		"When you use `{#each}` in Svelte, always consider adding a key for optimal performance: `{#each items as item (item.id)}`. This helps Svelte efficiently update the DOM.",
		"The `$effect` rune is for side effects — things like logging, API calls, or DOM manipulation. Unlike `$derived`, effects don't return a value. They run after the component updates."
	];

	const response = responses[Math.floor(Math.random() * responses.length)];

	return json({ response });
};
