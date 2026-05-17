import type { Module } from '$types/lesson';
import { stateBasics } from './01-state-basics';
import { derivedValues } from './02-derived-values';
import { effectBasics } from './03-effect-basics';
import { propsAndBindable } from './04-props-and-bindable';
import { inspectAndDebugging } from './05-inspect-and-debugging';
import { stateSnapshot } from './06-state-snapshot';

export const runesReactivityModule: Module = {
	id: 'runes-reactivity',
	slug: 'runes-reactivity',
	title: 'Runes & Reactivity',
	description:
		'Master Svelte 5 runes — $state, $derived, $effect — and understand how reactivity works under the hood.',
	trackId: 'svelte-core',
	order: 2,
	lessons: [stateBasics, derivedValues, effectBasics, propsAndBindable, inspectAndDebugging, stateSnapshot]
};
