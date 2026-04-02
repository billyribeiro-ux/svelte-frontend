import type { Module } from '$types/lesson';
import { ifBlocks } from './01-if-blocks';
import { eachBlocks } from './02-each-blocks';
import { awaitBlocks } from './03-await-blocks';
import { keyBlocks } from './04-key-blocks';
import { constInTemplates } from './05-const-in-templates';

export const controlFlowModule: Module = {
	id: 'control-flow',
	slug: 'control-flow',
	title: 'Control Flow & Rendering',
	description:
		'Master conditional rendering, list rendering, async data, key blocks, and template constants in Svelte.',
	trackId: 'svelte-core',
	order: 3,
	lessons: [ifBlocks, eachBlocks, awaitBlocks, keyBlocks, constInTemplates]
};
