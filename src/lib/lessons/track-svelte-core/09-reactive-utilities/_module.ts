import type { Module } from '$types/lesson';
import { reactiveBuiltins } from './01-reactive-builtins';
import { mediaQueryAndSubscribers } from './02-media-query-and-subscribers';

export const reactiveUtilitiesModule: Module = {
	id: 'reactive-utilities',
	slug: 'reactive-utilities',
	title: 'Reactive Utilities',
	description:
		'Use SvelteMap, SvelteSet, SvelteURL, MediaQuery, createSubscriber, and reactive window values for advanced reactivity.',
	trackId: 'svelte-core',
	order: 9,
	lessons: [reactiveBuiltins, mediaQueryAndSubscribers]
};
