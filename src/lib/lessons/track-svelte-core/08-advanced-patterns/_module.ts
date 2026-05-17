import type { Module } from '$types/lesson';
import { reactiveClasses } from './01-reactive-classes';
import { attachments } from './02-attachments';
import { errorBoundaries } from './03-error-boundaries';
import { dynamicComponents } from './04-dynamic-components';
import { contextApi } from './05-context-api';
import { reactiveBuiltins } from './06-reactive-builtins';

export const advancedPatternsModule: Module = {
	id: 'advanced-patterns',
	slug: 'advanced-patterns',
	title: 'Advanced Patterns',
	description:
		'Master reactive classes, attachments, error boundaries, dynamic components, context, and reactive built-ins in Svelte 5.',
	trackId: 'svelte-core',
	order: 8,
	lessons: [reactiveClasses, attachments, errorBoundaries, dynamicComponents, contextApi, reactiveBuiltins]
};
