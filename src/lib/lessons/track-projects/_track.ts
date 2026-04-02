import type { Track } from '$types/lesson';
import { buildABlogModule } from './01-build-a-blog/_module';
import { buildADashboardModule } from './02-build-a-dashboard/_module';
import { buildATaskManagerModule } from './03-build-a-task-manager/_module';
import { buildASaasModule } from './04-build-a-saas/_module';

export const projectsTrack: Track = {
	id: 'projects',
	slug: 'projects',
	title: 'Build Projects',
	description:
		'Apply your Svelte 5 knowledge by building real-world projects — a blog, dashboard, task manager, and SaaS application.',
	order: 3,
	modules: [buildABlogModule, buildADashboardModule, buildATaskManagerModule, buildASaasModule]
};
