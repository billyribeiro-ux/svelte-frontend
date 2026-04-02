import type { Module } from '$types/lesson';
import { elementEvents } from './01-element-events';
import { elementBindings } from './02-element-bindings';
import { mediaBindings } from './03-media-bindings';
import { dimensionBindings } from './04-dimension-bindings';
import { styleDirective } from './05-style-directive';
import { programmaticEvents } from './06-programmatic-events';

export const eventsAndBindingsModule: Module = {
	id: 'events-and-bindings',
	slug: 'events-and-bindings',
	title: 'Events & Bindings',
	description:
		'Handle DOM events, master bindings, dynamic styles, custom properties, and programmatic event listeners.',
	trackId: 'svelte-core',
	order: 6,
	lessons: [elementEvents, elementBindings, mediaBindings, dimensionBindings, styleDirective, programmaticEvents]
};
