import type { Track } from '$types/lesson';
import { svelteBasicsModule } from './01-svelte-basics/_module';
import { runesReactivityModule } from './02-runes-reactivity/_module';

export const svelteCoreTrack: Track = {
	id: 'svelte-core',
	slug: 'svelte-core',
	title: 'Svelte 5 Core',
	description:
		'Master Svelte 5 from the ground up — components, runes, reactivity, composition, and advanced patterns.',
	order: 1,
	modules: [svelteBasicsModule, runesReactivityModule]
};
