import type { Module } from '$types/lesson';
import { propsInDepth } from './01-props-in-depth';
import { componentEvents } from './02-component-events';
import { contextApi } from './03-context-api';
import { componentLifecycle } from './04-component-lifecycle';

export const componentsAndPropsModule: Module = {
	id: 'components-and-props',
	slug: 'components-and-props',
	title: 'Components & Props',
	description:
		'Deep dive into component APIs, callback props, context, and lifecycle in Svelte 5.',
	trackId: 'svelte-core',
	order: 4,
	lessons: [propsInDepth, componentEvents, contextApi, componentLifecycle]
};
