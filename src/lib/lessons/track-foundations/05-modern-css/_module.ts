import type { Module } from '$types/lesson';
import { hasSelector } from './01-has-selector';
import { containerQueries } from './02-container-queries';
import { nativeNesting } from './03-native-nesting';
import { cssLayers } from './04-css-layers';

export const modernCssModule: Module = {
	id: 'modern-css',
	slug: 'modern-css',
	title: 'Modern CSS',
	description: 'Explore cutting-edge CSS features — :has(), container queries, native nesting, and cascade layers.',
	trackId: 'foundations',
	order: 5,
	lessons: [hasSelector, containerQueries, nativeNesting, cssLayers]
};
