import type { LessonMeta } from '$lib/types';
import { course } from '$data/curriculum';

function flattenLessons(): LessonMeta[] {
	return course.phases.flatMap((phase) =>
		phase.modules.flatMap((mod) => mod.lessons)
	);
}

export function getNextLesson(currentId: string): LessonMeta | null {
	const lessons = flattenLessons();
	const idx = lessons.findIndex((l) => l.id === currentId);
	if (idx === -1 || idx === lessons.length - 1) return null;
	return lessons[idx + 1] ?? null;
}

export function getPrevLesson(currentId: string): LessonMeta | null {
	const lessons = flattenLessons();
	const idx = lessons.findIndex((l) => l.id === currentId);
	if (idx <= 0) return null;
	return lessons[idx - 1] ?? null;
}

export function getAllLessons(): LessonMeta[] {
	return flattenLessons();
}
