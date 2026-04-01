import type { Module } from '$types/lesson';
import { ifBlocks } from './01-if-blocks';
import { eachBlocks } from './02-each-blocks';
import { awaitBlocks } from './03-await-blocks';

export const controlFlowModule: Module = {
	id: 'control-flow',
	slug: 'control-flow',
	title: 'Control Flow & Rendering',
	description:
		'Master conditional rendering, list rendering, and async data handling in Svelte templates.',
	trackId: 'svelte-core',
	order: 3,
	lessons: [ifBlocks, eachBlocks, awaitBlocks]
};
