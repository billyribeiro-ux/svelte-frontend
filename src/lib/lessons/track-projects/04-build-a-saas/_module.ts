import type { Module } from '$types/lesson';
import { authSystem } from './01-auth-system';
import { apiLayer } from './02-api-layer';
import { userSettings } from './03-user-settings';
import { deployment } from './04-deployment';

export const buildASaasModule: Module = {
	id: 'build-a-saas',
	slug: 'build-a-saas',
	title: 'Build a SaaS',
	description:
		'Ship a production-ready SaaS application with authentication, API integration, user settings, and deployment strategies.',
	trackId: 'projects',
	order: 4,
	lessons: [authSystem, apiLayer, userSettings, deployment]
};
