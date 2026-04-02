import type { Module } from '$types/lesson';
import { ssrVsCsr } from './01-ssr-vs-csr';
import { pageOptions } from './02-page-options';
import { seoAndMeta } from './03-seo-and-meta';

export const ssrAndRenderingModule: Module = {
	id: 'ssr-and-rendering',
	slug: 'ssr-and-rendering',
	title: 'SSR & Rendering',
	description:
		'Understand server-side rendering, client-side rendering, page options, and SEO optimization.',
	trackId: 'sveltekit',
	order: 6,
	lessons: [ssrVsCsr, pageOptions, seoAndMeta]
};
