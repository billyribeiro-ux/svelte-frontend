import type { Module } from '$types/lesson';
import { fileBasedRouting } from './01-file-based-routing';
import { layouts } from './02-layouts';
import { dynamicRoutes } from './03-dynamic-routes';
import { errorPages } from './04-error-pages';

export const routingModule: Module = {
	id: 'routing',
	slug: 'routing',
	title: 'Routing',
	description:
		'Learn SvelteKit file-based routing, layouts, dynamic parameters, and error handling.',
	trackId: 'sveltekit',
	order: 1,
	lessons: [fileBasedRouting, layouts, dynamicRoutes, errorPages]
};
