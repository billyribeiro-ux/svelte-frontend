import type { Module } from '$types/lesson';
import { transitionDirective } from './01-transition-directive';
import { inAndOut } from './02-in-and-out';
import { customTransitions } from './03-custom-transitions';
import { animateDirective } from './04-animate-directive';
import { motionSpringTweened } from './05-motion-spring-tweened';

export const transitionsAndAnimationsModule: Module = {
	id: 'transitions-and-animations',
	slug: 'transitions-and-animations',
	title: 'Transitions & Animations',
	description:
		'Add smooth enter/exit transitions, reorder animations, and physics-based motion to your Svelte components.',
	trackId: 'svelte-core',
	order: 7,
	lessons: [transitionDirective, inAndOut, customTransitions, animateDirective, motionSpringTweened]
};
