import type { Module } from '$types/lesson';
import { elementEvents } from './01-element-events';
import { elementBindings } from './02-element-bindings';
import { mediaBindings } from './03-media-bindings';
import { dimensionBindings } from './04-dimension-bindings';

export const eventsAndBindingsModule: Module = {
	id: 'events-and-bindings',
	slug: 'events-and-bindings',
	title: 'Events & Bindings',
	description:
		'Handle DOM events the Svelte 5 way and master two-way bindings for forms, media, and dimensions.',
	trackId: 'svelte-core',
	order: 6,
	lessons: [elementEvents, elementBindings, mediaBindings, dimensionBindings]
};
