import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { initLessons } from '$lessons/init';
import { getLessonBySlug } from '$lessons/registry';

export const load: PageServerLoad = async ({ params }) => {
	const { trackSlug, moduleSlug, lessonSlug } = params;

	initLessons();

	const lesson = getLessonBySlug(trackSlug, moduleSlug, lessonSlug);

	if (!lesson) {
		throw error(404, `Lesson not found: ${trackSlug}/${moduleSlug}/${lessonSlug}`);
	}

	return {
		lesson,
		progress: {
			status: 'not_started' as const,
			checkpointsCompleted: [] as string[],
			codeSnapshots: {} as Record<string, string>,
			timeSpentSeconds: 0
		}
	};
};
