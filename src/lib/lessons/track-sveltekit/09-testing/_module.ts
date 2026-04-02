import type { Module } from '$types/lesson';
import { componentTesting } from './01-component-testing';

export const testingModule: Module = {
	id: 'testing',
	slug: 'testing',
	title: 'Testing',
	description:
		'Test Svelte 5 components with Vitest and @testing-library/svelte — unit tests, integration tests, and best practices.',
	trackId: 'sveltekit',
	order: 9,
	lessons: [componentTesting]
};
