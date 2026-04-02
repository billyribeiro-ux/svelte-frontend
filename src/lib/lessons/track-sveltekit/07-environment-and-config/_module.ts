import type { Module } from '$types/lesson';
import { environmentVariables } from './01-environment-variables';
import { appModules } from './02-app-modules';
import { svelteConfig } from './03-svelte-config';

export const environmentAndConfigModule: Module = {
	id: 'environment-and-config',
	slug: 'environment-and-config',
	title: 'Environment & Config',
	description:
		'Work with environment variables, SvelteKit app modules, and configuration.',
	trackId: 'sveltekit',
	order: 7,
	lessons: [environmentVariables, appModules, svelteConfig]
};
