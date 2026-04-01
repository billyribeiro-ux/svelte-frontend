import type { Track, Module, Lesson } from '$types/lesson';

const tracks: Track[] = [];
const lessonsMap = new Map<string, Lesson>();

export function registerTrack(track: Track) {
	tracks.push(track);
	for (const mod of track.modules) {
		for (const lesson of mod.lessons) {
			lessonsMap.set(lesson.id, lesson);
		}
	}
}

export function getAllTracks(): Track[] {
	return tracks;
}

export function getTrack(slug: string): Track | undefined {
	return tracks.find((t) => t.slug === slug);
}

export function getModule(trackSlug: string, moduleSlug: string): Module | undefined {
	const track = getTrack(trackSlug);
	return track?.modules.find((m) => m.slug === moduleSlug);
}

export function getLessonBySlug(
	trackSlug: string,
	moduleSlug: string,
	lessonSlug: string
): Lesson | undefined {
	const module = getModule(trackSlug, moduleSlug);
	return module?.lessons.find((l) => l.slug === lessonSlug);
}

export function getLessonById(id: string): Lesson | undefined {
	return lessonsMap.get(id);
}

export function getNextLesson(
	trackSlug: string,
	moduleSlug: string,
	lessonSlug: string
): Lesson | undefined {
	const module = getModule(trackSlug, moduleSlug);
	if (!module) return undefined;
	const idx = module.lessons.findIndex((l) => l.slug === lessonSlug);
	return idx >= 0 && idx < module.lessons.length - 1 ? module.lessons[idx + 1] : undefined;
}

export function getPrevLesson(
	trackSlug: string,
	moduleSlug: string,
	lessonSlug: string
): Lesson | undefined {
	const module = getModule(trackSlug, moduleSlug);
	if (!module) return undefined;
	const idx = module.lessons.findIndex((l) => l.slug === lessonSlug);
	return idx > 0 ? module.lessons[idx - 1] : undefined;
}
