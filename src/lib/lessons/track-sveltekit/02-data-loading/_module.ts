import type { Module } from '$types/lesson';
import { serverLoad } from './01-server-load';
import { universalLoad } from './02-universal-load';
import { layoutData } from './03-layout-data';
import { invalidation } from './04-invalidation';
import { streamingAndDeferred } from './05-streaming-and-deferred';

export const dataLoadingModule: Module = {
	id: 'data-loading',
	slug: 'data-loading',
	title: 'Data Loading',
	description:
		'Master server and universal load functions, layout data sharing, and data invalidation.',
	trackId: 'sveltekit',
	order: 2,
	lessons: [serverLoad, universalLoad, layoutData, invalidation, streamingAndDeferred]
};
