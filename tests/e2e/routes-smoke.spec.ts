import { test, expect } from '@playwright/test';
import { course } from '../../src/lib/data/curriculum';

interface FlatLesson {
	id: string;
	phaseIdx: number;
	moduleIdx: number;
	lessonIdx: number;
	url: string;
	title: string;
}

const lessons: FlatLesson[] = course.phases.flatMap((phase) =>
	phase.modules.flatMap((module) =>
		module.lessons.map((lesson) => ({
			id: lesson.id,
			phaseIdx: phase.index,
			moduleIdx: module.index,
			lessonIdx: lesson.lessonIndex,
			url: `/course/${phase.index}/${module.index}/${lesson.lessonIndex}`,
			title: lesson.title
		}))
	)
);

test('covers all 149 lessons', () => {
	expect(lessons.length).toBe(149);
});

test.describe.parallel('route smoke', () => {
	for (const lesson of lessons) {
		test(`loads ${lesson.url} — ${lesson.title}`, async ({ page }) => {
			await page.route('**/*', (route) => {
				const url = route.request().url();
				if (/webcontainer|stackblitz/.test(url)) return route.abort();
				return route.continue();
			});

			const response = await page.goto(lesson.url);
			expect(response, `no response for ${lesson.url}`).not.toBeNull();
			expect(response!.ok(), `bad status ${response!.status()} for ${lesson.url}`).toBe(true);

			const title = await page.title();
			expect(title.length).toBeGreaterThan(0);
		});
	}
});
