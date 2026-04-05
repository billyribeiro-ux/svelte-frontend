import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'svelte-pe7-progress';

test('mark complete persists across reload', async ({ page, context }) => {
	await page.route('**/*', (route) => {
		const url = route.request().url();
		if (/webcontainer|stackblitz/.test(url)) return route.abort();
		return route.continue();
	});

	// Start fresh
	await context.clearCookies();
	await page.goto('/course/1/0/1');
	await page.evaluate(() => localStorage.clear());
	await page.reload();

	const btn = page.getByRole('button', { name: /Mark Complete/i });
	await expect(btn).toBeVisible();
	await expect(btn).toBeEnabled();

	await btn.click();

	// After click, button becomes "Completed" and disabled.
	const completedBtn = page.getByRole('button', { name: /Completed/i });
	await expect(completedBtn).toBeVisible();
	await expect(completedBtn).toBeDisabled();

	// Assert localStorage contains the lesson id ("0-1")
	const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
	expect(stored).toBeTruthy();
	expect(stored!).toContain('0-1');

	// Reload — persistence
	await page.reload();
	const afterReload = page.getByRole('button', { name: /Completed/i });
	await expect(afterReload).toBeVisible();
	await expect(afterReload).toBeDisabled();
});
