import { describe, it, expect } from 'vitest';
import { course } from '../../../src/lib/data/curriculum';

// Enumerate all lesson files on disk via import.meta.glob.
const lessonModules = import.meta.glob('../../../src/lib/data/lessons/*.ts');
const lessonFilenames = Object.keys(lessonModules).map((p) => {
	const base = p.split('/').pop() as string;
	return base.replace(/\.ts$/, '');
});

describe('curriculum', () => {
	it('has exactly 7 phases', () => {
		expect(course.phases).toHaveLength(7);
	});

	it('every phase has id/title/modules and at least 1 module', () => {
		for (const phase of course.phases) {
			expect(typeof phase.index).toBe('number');
			expect(typeof phase.title).toBe('string');
			expect(phase.title.length).toBeGreaterThan(0);
			expect(Array.isArray(phase.modules)).toBe(true);
			expect(phase.modules.length).toBeGreaterThanOrEqual(1);
		}
	});

	it('every module has at least 1 lesson', () => {
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				expect(Array.isArray(mod.lessons)).toBe(true);
				expect(mod.lessons.length).toBeGreaterThanOrEqual(1);
			}
		}
	});

	it('lessonCount on each module matches its lessons array length', () => {
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				expect(mod.lessonCount).toBe(mod.lessons.length);
			}
		}
	});

	it('has exactly 149 total lessons', () => {
		const total = course.phases
			.flatMap((p) => p.modules)
			.flatMap((m) => m.lessons).length;
		expect(total).toBe(149);
	});

	it('matches the lesson file count on disk', () => {
		expect(lessonFilenames.length).toBe(149);
	});

	it('all lesson ids match /^\\d+-\\d+$/', () => {
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				for (const lesson of mod.lessons) {
					expect(lesson.id).toMatch(/^\d+-\d+$/);
				}
			}
		}
	});

	it('has no duplicate lesson ids', () => {
		const ids: string[] = [];
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				for (const lesson of mod.lessons) {
					ids.push(lesson.id);
				}
			}
		}
		const unique = new Set(ids);
		expect(unique.size).toBe(ids.length);
	});

	it('every lesson id has a matching file under src/lib/data/lessons/', () => {
		const onDisk = new Set(lessonFilenames);
		const missing: string[] = [];
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				for (const lesson of mod.lessons) {
					if (!onDisk.has(lesson.id)) missing.push(lesson.id);
				}
			}
		}
		expect(missing).toEqual([]);
	});

	it('every lesson file on disk is referenced in the curriculum', () => {
		const inCurriculum = new Set<string>();
		for (const phase of course.phases) {
			for (const mod of phase.modules) {
				for (const lesson of mod.lessons) {
					inCurriculum.add(lesson.id);
				}
			}
		}
		const orphans = lessonFilenames.filter((f) => !inCurriculum.has(f));
		expect(orphans).toEqual([]);
	});
});
