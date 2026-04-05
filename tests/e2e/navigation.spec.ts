import { test, expect } from '@playwright/test';

// Block webcontainer / stackblitz requests so tests aren't flaky due to external deps.
async function blockWebContainer(page: import('@playwright/test').Page) {
	await page.route('**/*', (route) => {
		const url = route.request().url();
		if (/webcontainer|stackblitz/.test(url)) return route.abort();
		return route.continue();
	});
}

test.describe('lesson navigation', () => {
	test('sidebar navigation and browser history', async ({ page }) => {
		await blockWebContainer(page);

		await page.goto('/course/1/0/1');
		// Sidebar is an <aside class="sidebar">
		const sidebar = page.locator('aside.sidebar');
		await expect(sidebar).toBeVisible();

		// Navigate to lesson 0-2 via its sidebar link
		const lesson2Link = sidebar.locator('a[href="/course/1/0/2"]').first();
		await expect(lesson2Link).toBeVisible();
		await lesson2Link.click();
		await expect(page).toHaveURL(/\/course\/1\/0\/2$/);

		// Go back
		await page.goBack();
		await expect(page).toHaveURL(/\/course\/1\/0\/1$/);

		// Go forward
		await page.goForward();
		await expect(page).toHaveURL(/\/course\/1\/0\/2$/);
	});
});
