import type { Module } from '$types/lesson';
import { blogProjectSetup } from './01-blog-project-setup';
import { blogPosts } from './02-blog-posts';
import { blogListing } from './03-blog-listing';
import { blogSeo } from './04-blog-seo';

export const buildABlogModule: Module = {
	id: 'build-a-blog',
	slug: 'build-a-blog',
	title: 'Build a Blog',
	description:
		'Create a fully functional blog application with Svelte 5 — from project scaffolding to SEO optimization.',
	trackId: 'projects',
	order: 1,
	lessons: [blogProjectSetup, blogPosts, blogListing, blogSeo]
};
