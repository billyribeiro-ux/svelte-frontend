import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { trackSlug, moduleSlug, lessonSlug } = params;

	// Attempt to load lesson from registry if available
	let lesson = null;
	try {
		const { getLessonBySlug } = await import('$lessons/registry');
		lesson = getLessonBySlug(trackSlug, moduleSlug, lessonSlug);
	} catch {
		// Registry not ready yet — use placeholder
	}

	if (lesson) {
		return {
			lesson,
			starterFiles: lesson.starterFiles ?? {},
			progress: {
				status: 'not_started' as const,
				checkpointsCompleted: [],
				codeSnapshots: {},
				timeSpentSeconds: 0
			}
		};
	}

	// Placeholder data when lesson registry is not yet available
	return {
		lesson: {
			id: `${trackSlug}/${moduleSlug}/${lessonSlug}`,
			title: lessonSlug
				.split('-')
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' '),
			trackSlug,
			moduleSlug,
			lessonSlug,
			content: 'Lesson content will be loaded from the registry.',
			concepts: [],
			checkpoints: []
		},
		starterFiles: {
			'App.svelte': '<h1>Hello from SvelteForge</h1>'
		},
		progress: {
			status: 'not_started' as const,
			checkpointsCompleted: [],
			codeSnapshots: {},
			timeSpentSeconds: 0
		}
	};
};
