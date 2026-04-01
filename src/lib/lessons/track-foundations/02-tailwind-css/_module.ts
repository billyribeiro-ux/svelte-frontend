import type { Module } from '$types/lesson';
import { utilityFirstBasics } from './01-utility-first-basics';
import { responsiveDesign } from './02-responsive-design';
import { stateVariants } from './03-state-variants';
import { customization } from './04-customization';
import { tailwindInSvelte } from './05-tailwind-in-svelte';

export const tailwindCssModule: Module = {
	id: 'tailwind-css',
	slug: 'tailwind-css',
	title: 'Tailwind CSS',
	description:
		'Learn utility-first CSS with Tailwind — from basics to custom configurations and Svelte integration.',
	trackId: 'foundations',
	order: 2,
	lessons: [utilityFirstBasics, responsiveDesign, stateVariants, customization, tailwindInSvelte]
};
