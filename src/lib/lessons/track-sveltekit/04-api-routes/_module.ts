import type { Module } from '$types/lesson';
import { serverEndpoints } from './01-server-endpoints';
import { requestResponse } from './02-request-response';
import { streaming } from './03-streaming';

export const apiRoutesModule: Module = {
	id: 'api-routes',
	slug: 'api-routes',
	title: 'API Routes',
	description:
		'Build API endpoints with +server.ts, handle requests and responses, and implement streaming.',
	trackId: 'sveltekit',
	order: 4,
	lessons: [serverEndpoints, requestResponse, streaming]
};
