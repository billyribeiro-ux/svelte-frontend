import type { Module } from '$types/lesson';
import { handleHook } from './01-handle-hook';
import { handleError } from './02-handle-error';
import { sequence } from './03-sequence';

export const hooksAndMiddlewareModule: Module = {
	id: 'hooks-and-middleware',
	slug: 'hooks-and-middleware',
	title: 'Hooks & Middleware',
	description:
		'Intercept requests with hooks, handle errors globally, and compose middleware chains.',
	trackId: 'sveltekit',
	order: 5,
	lessons: [handleHook, handleError, sequence]
};
