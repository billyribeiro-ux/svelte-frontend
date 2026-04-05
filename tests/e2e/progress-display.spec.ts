import { test, expect } from '@playwright/test';

test('completing a lesson increments the sidebar progress count', async ({ page, context }) => {
	await page.route('**/*', (route) => {
		const url = route.request().url();
		if (/webcontainer|stackblitz/.test(url)) return route.abort();
		return route.continue();
	});

	await context.clearCookies();
	await page.goto('/course/1/0/1');
	await page.evaluate(() => localStorage.clear());
	await page.reload();

	// Baseline — sidebar shows "N/TOTAL lessons complete"
	const progressText = page.locator('.progress-summary .progress-text');
	await expect(progressText).toBeVisible();
	const baseline = await progressText.textContent();
	expect(baseline).toMatch(/0\/\d+\s+lessons complete/);

	// Mark complete
	await page.getByRole('button', { name: /Mark Complete/i }).click();

	// Sidebar updates reactively
	await expect(progressText).toHaveText(/1\/\d+\s+lessons complete/);

	// Also check after navigating to landing — sidebar persists at app layout level if mounted there,
	// but landing route does not render sidebar. Navigate to a different lesson to re-verify.
	await page.goto('/course/1/0/2');
	await expect(page.locator('.progress-summary .progress-text')).toHaveText(
		/1\/\d+\s+lessons complete/
	);
});
