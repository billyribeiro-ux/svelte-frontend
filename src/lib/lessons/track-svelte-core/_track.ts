import type { Track } from '$types/lesson';
import { svelteBasicsModule } from './01-svelte-basics/_module';
import { runesReactivityModule } from './02-runes-reactivity/_module';
import { controlFlowModule } from './03-control-flow/_module';
import { componentsAndPropsModule } from './04-components-and-props/_module';
import { snippetsAndCompositionModule } from './05-snippets-and-composition/_module';
import { eventsAndBindingsModule } from './06-events-and-bindings/_module';
import { transitionsAndAnimationsModule } from './07-transitions-and-animations/_module';
import { advancedPatternsModule } from './08-advanced-patterns/_module';
import { reactiveUtilitiesModule } from './09-reactive-utilities/_module';

export const svelteCoreTrack: Track = {
	id: 'svelte-core',
	slug: 'svelte-core',
	title: 'Svelte 5 Core',
	description:
		'Master Svelte 5 from the ground up — components, runes, reactivity, composition, animations, and advanced patterns.',
	order: 1,
	modules: [
		svelteBasicsModule,
		runesReactivityModule,
		controlFlowModule,
		componentsAndPropsModule,
		snippetsAndCompositionModule,
		eventsAndBindingsModule,
		transitionsAndAnimationsModule,
		advancedPatternsModule,
		reactiveUtilitiesModule
	]
};
