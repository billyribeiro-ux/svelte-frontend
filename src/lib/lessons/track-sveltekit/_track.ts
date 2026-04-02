import type { Track } from '$types/lesson';
import { routingModule } from './01-routing/_module';
import { dataLoadingModule } from './02-data-loading/_module';
import { formActionsModule } from './03-form-actions/_module';
import { apiRoutesModule } from './04-api-routes/_module';
import { hooksAndMiddlewareModule } from './05-hooks-and-middleware/_module';
import { ssrAndRenderingModule } from './06-ssr-and-rendering/_module';
import { environmentAndConfigModule } from './07-environment-and-config/_module';
import { advancedSvelteKitModule } from './08-advanced-sveltekit/_module';
import { testingModule } from './09-testing/_module';

export const svelteKitTrack: Track = {
	id: 'sveltekit',
	slug: 'sveltekit',
	title: 'SvelteKit Mastery',
	description:
		'Master SvelteKit 2 — routing, data loading, form actions, API routes, hooks, SSR, deployment, and testing.',
	order: 2,
	modules: [
		routingModule,
		dataLoadingModule,
		formActionsModule,
		apiRoutesModule,
		hooksAndMiddlewareModule,
		ssrAndRenderingModule,
		environmentAndConfigModule,
		advancedSvelteKitModule,
		testingModule
	]
};
