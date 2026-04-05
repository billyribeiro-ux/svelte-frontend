import { test, expect } from '@playwright/test';

test('lesson shell mounts sidebar, content, IDE, and splitpanes', async ({ page }) => {
	await page.route('**/*', (route) => {
		const url = route.request().url();
		if (/webcontainer|stackblitz/.test(url)) return route.abort();
		return route.continue();
	});

	await page.goto('/course/1/0/1');

	// Sidebar
	await expect(page.locator('aside.sidebar')).toBeVisible();

	// Lesson content title (h1 inside .lesson-content)
	const lessonTitle = page.locator('.lesson-content h1.lesson-title');
	await expect(lessonTitle).toBeVisible();
	await expect(lessonTitle).not.toBeEmpty();

	// IDE root — the IDE component wraps everything in .ide-container
	await expect(page.locator('.ide-container')).toBeVisible();

	// svelte-splitpanes dividers exist (LessonShell uses Splitpanes, and so does IDE)
	const splitters = page.locator('.splitpanes__splitter');
	await expect(splitters.first()).toBeVisible();
	expect(await splitters.count()).toBeGreaterThanOrEqual(1);
});
