import type { Module } from '$types/lesson';
import { reactiveClasses } from './01-reactive-classes';
import { attachments } from './02-attachments';
import { errorBoundaries } from './03-error-boundaries';
import { dynamicComponents } from './04-dynamic-components';
import { rawHtmlAndSecurity } from './05-raw-html-and-security';
import { asyncComponents } from './06-async-components';

export const advancedPatternsModule: Module = {
	id: 'advanced-patterns',
	slug: 'advanced-patterns',
	title: 'Advanced Patterns',
	description:
		'Master reactive classes, attachments, error boundaries, dynamic components, raw HTML, and async components.',
	trackId: 'svelte-core',
	order: 8,
	lessons: [reactiveClasses, attachments, errorBoundaries, dynamicComponents, rawHtmlAndSecurity, asyncComponents]
};
