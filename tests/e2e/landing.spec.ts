import { test, expect } from '@playwright/test';

test.describe('landing page', () => {
	test('renders hero, stats, and phase cards', async ({ page }) => {
		await page.goto('/');

		// Hero heading (scoped to <main> — the sidebar also has an <h1> with the app title)
		await expect(
			page.getByRole('main').getByRole('heading', { level: 1 })
		).toContainText('Svelte PE7 Mastery');

		// Subtitle / method
		await expect(
			page.getByText('JavaScript + TypeScript + Svelte 5 + SvelteKit + SEO')
		).toBeVisible();
		await expect(page.getByText('DiCenso Method')).toBeVisible();

		// Stats
		await expect(page.getByText('21', { exact: true })).toBeVisible();
		await expect(page.getByText('155', { exact: true })).toBeVisible();
		await expect(page.getByText('7', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Modules', { exact: true })).toBeVisible();
		await expect(page.getByText('Lessons', { exact: true })).toBeVisible();
		await expect(page.getByText('Phases', { exact: true })).toBeVisible();

		// Phase cards — section title + at least 7 phase names (h3)
		await expect(page.getByRole('heading', { level: 2, name: 'Course Phases' })).toBeVisible();
		const phaseHeadings = page.getByRole('heading', { level: 3 });
		await expect(phaseHeadings).toHaveCount(7);
	});

	test('Start Learning navigates to /course/1/0/1', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Start Learning' }).click();
		await expect(page).toHaveURL(/\/course\/1\/0\/1$/);
	});
});
