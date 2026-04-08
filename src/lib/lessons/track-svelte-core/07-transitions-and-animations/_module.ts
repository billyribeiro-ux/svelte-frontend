import type { Module } from '$types/lesson';
import { transitionDirective } from './01-transition-directive';
import { inAndOut } from './02-in-and-out';
import { customTransitions } from './03-custom-transitions';
import { animateDirective } from './04-animate-directive';
import { springAndTween } from './05-spring-and-tween';
import { crossfadeTransition } from './06-crossfade';
import { allBuiltInTransitions } from './07-all-built-in-transitions';
import { easingFunctions } from './08-easing-functions';
import { staggeredAnimations } from './09-staggered-animations';

export const transitionsAndAnimationsModule: Module = {
	id: 'transitions-and-animations',
	slug: 'transitions-and-animations',
	title: 'Transitions & Animations',
	description:
		'Add smooth enter/exit transitions and reorder animations to your Svelte components.',
	trackId: 'svelte-core',
	order: 7,
	lessons: [transitionDirective, inAndOut, customTransitions, animateDirective, springAndTween, crossfadeTransition, allBuiltInTransitions, easingFunctions, staggeredAnimations]
};
