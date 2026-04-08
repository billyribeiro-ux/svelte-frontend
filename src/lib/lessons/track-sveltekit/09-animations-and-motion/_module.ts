import type { Module } from '$types/lesson';
import { viewTransitions } from './01-view-transitions';
import { pageTransitions } from './02-page-transitions';
import { navigationLoading } from './03-navigation-loading';
import { scrollBehavior } from './04-scroll-behavior';

export const animationsAndMotionModule: Module = {
	id: 'animations-and-motion',
	slug: 'animations-and-motion',
	title: 'Animations & Motion',
	description:
		'Master every SvelteKit animation capability — View Transitions API, page transitions, navigation progress indicators, and scroll position management.',
	trackId: 'sveltekit',
	order: 9,
	lessons: [viewTransitions, pageTransitions, navigationLoading, scrollBehavior]
};
