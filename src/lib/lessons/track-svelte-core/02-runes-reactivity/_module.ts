import type { Module } from '$types/lesson';
import { stateBasics } from './01-state-basics';
import { derivedValues } from './02-derived-values';

export const runesReactivityModule: Module = {
	id: 'runes-reactivity',
	slug: 'runes-reactivity',
	title: 'Runes & Reactivity',
	description:
		'Master Svelte 5 runes — $state, $derived, $effect — and understand how reactivity works under the hood.',
	trackId: 'svelte-core',
	order: 2,
	lessons: [stateBasics, derivedValues]
};
