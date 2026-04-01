import type { Track } from '$types/lesson';
import { htmlEssentialsModule } from './01-html-essentials/_module';
import { tailwindCssModule } from './02-tailwind-css/_module';

export const foundationsTrack: Track = {
	id: 'foundations',
	slug: 'foundations',
	title: 'Web Foundations',
	description:
		'Build a solid understanding of HTML, CSS, and JavaScript fundamentals before diving into Svelte.',
	order: 0,
	modules: [htmlEssentialsModule, tailwindCssModule]
};
