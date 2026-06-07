import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('accessibility', () => {
	test('landing page has no critical a11y violations', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');

		const results = await new AxeBuilder({ page } as any).analyze();

		if (results.violations.length > 0) {
			const summary = results.violations.map(
				(v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
			);
			console.log('A11y violations on landing page:\n' + summary.join('\n'));
		}

		// Soft assertion — log violations but only fail on serious/critical
		const critical = results.violations.filter(
			(v) => v.impact === 'critical' || v.impact === 'serious'
		);
		expect(
			critical,
			`Found ${critical.length} serious/critical a11y violations`
		).toHaveLength(0);
	});

	test('lesson page has no critical a11y violations', async ({ page }) => {
		// Block WebContainer requests to avoid timeouts
		await page.route('**/webcontainer/**', (route) => route.abort());
		await page.route('**/iframe/**', (route) => route.abort());

		await page.goto('/course/1/0/1');
		await page.waitForLoadState('domcontentloaded');

		const results = await new AxeBuilder({ page } as any)
			.exclude('.monaco-editor')
			.exclude('iframe')
			.analyze();

		if (results.violations.length > 0) {
			const summary = results.violations.map(
				(v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
			);
			console.log('A11y violations on lesson page:\n' + summary.join('\n'));
		}

		// Soft assertion — log violations but only fail on serious/critical
		const critical = results.violations.filter(
			(v) => v.impact === 'critical' || v.impact === 'serious'
		);
		expect(
			critical,
			`Found ${critical.length} serious/critical a11y violations`
		).toHaveLength(0);
	});
});
