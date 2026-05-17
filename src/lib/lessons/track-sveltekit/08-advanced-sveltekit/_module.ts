import type { Module } from '$types/lesson';
import { remoteFunctions } from './01-remote-functions';
import { adapters } from './02-adapters';
import { deployment } from './03-deployment';
import { shallowRouting } from './04-shallow-routing';
import { snapshots } from './05-snapshots';
import { linkOptions } from './06-link-options';
import { serviceWorkers } from './07-service-workers';

export const advancedSvelteKitModule: Module = {
	id: 'advanced-sveltekit',
	slug: 'advanced-sveltekit',
	title: 'Advanced SvelteKit',
	description:
		'Remote functions, adapters, deployment, shallow routing, snapshots, link options, and service workers.',
	trackId: 'sveltekit',
	order: 8,
	lessons: [remoteFunctions, adapters, deployment, shallowRouting, snapshots, linkOptions, serviceWorkers]
};
