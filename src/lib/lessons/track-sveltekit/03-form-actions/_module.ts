import type { Module } from '$types/lesson';
import { defaultActions } from './01-default-actions';
import { namedActions } from './02-named-actions';
import { progressiveEnhancement } from './03-progressive-enhancement';

export const formActionsModule: Module = {
	id: 'form-actions',
	slug: 'form-actions',
	title: 'Form Actions',
	description:
		'Handle form submissions with SvelteKit actions, named actions, and progressive enhancement.',
	trackId: 'sveltekit',
	order: 3,
	lessons: [defaultActions, namedActions, progressiveEnhancement]
};
