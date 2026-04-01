import type { Module } from '$types/lesson';
import { remoteFunctions } from './01-remote-functions';
import { adapters } from './02-adapters';
import { deployment } from './03-deployment';

export const advancedSvelteKitModule: Module = {
	id: 'advanced-sveltekit',
	slug: 'advanced-sveltekit',
	title: 'Advanced SvelteKit',
	description:
		'Explore remote functions, adapters for different platforms, and production deployment.',
	trackId: 'sveltekit',
	order: 8,
	lessons: [remoteFunctions, adapters, deployment]
};
