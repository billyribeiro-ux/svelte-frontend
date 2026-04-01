import type { Module } from '$types/lesson';
import { snippetBasics } from './01-snippet-basics';
import { snippetsAsProps } from './02-snippets-as-props';
import { childrenSnippet } from './03-children-snippet';
import { advancedSnippetPatterns } from './04-advanced-snippet-patterns';

export const snippetsAndCompositionModule: Module = {
	id: 'snippets-and-composition',
	slug: 'snippets-and-composition',
	title: 'Snippets & Composition',
	description:
		'Master Svelte 5 snippets for reusable templates, component composition, and replacing slots.',
	trackId: 'svelte-core',
	order: 5,
	lessons: [snippetBasics, snippetsAsProps, childrenSnippet, advancedSnippetPatterns]
};
