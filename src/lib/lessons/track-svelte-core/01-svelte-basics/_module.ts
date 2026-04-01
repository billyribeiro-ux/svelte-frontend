import type { Module } from '$types/lesson';
import { yourFirstComponent } from './01-your-first-component';
import { templateExpressions } from './02-template-expressions';
import { stylingComponents } from './03-styling-components';
import { componentComposition } from './04-component-composition';
import { dynamicAttributes } from './05-dynamic-attributes';
import { specialElements } from './06-special-elements';

export const svelteBasicsModule: Module = {
	id: 'svelte-basics',
	slug: 'svelte-basics',
	title: 'Svelte Basics',
	description: 'Learn the fundamentals of Svelte 5 components, templates, and styling.',
	trackId: 'svelte-core',
	order: 1,
	lessons: [
		yourFirstComponent,
		templateExpressions,
		stylingComponents,
		componentComposition,
		dynamicAttributes,
		specialElements
	]
};
