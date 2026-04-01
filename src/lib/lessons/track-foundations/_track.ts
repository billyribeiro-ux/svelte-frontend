import type { Track } from '$types/lesson';
import { htmlEssentialsModule } from './01-html-essentials/_module';
import { tailwindCssModule } from './02-tailwind-css/_module';
import { cssFundamentalsModule } from './03-css-fundamentals/_module';
import { cssLayoutModule } from './04-css-layout/_module';
import { modernCssModule } from './05-modern-css/_module';
import { typescriptEssentialsModule } from './06-typescript-essentials/_module';

export const foundationsTrack: Track = {
	id: 'foundations',
	slug: 'foundations',
	title: 'Web Foundations',
	description:
		'Build a solid understanding of HTML, CSS, and JavaScript fundamentals before diving into Svelte.',
	order: 0,
	modules: [htmlEssentialsModule, tailwindCssModule, cssFundamentalsModule, cssLayoutModule, modernCssModule, typescriptEssentialsModule]
};
