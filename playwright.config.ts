import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	retries: 0,
	workers: 2,
	reporter: [['list'], ['json', { outputFile: 'tests/reports/playwright.json' }]],
	use: {
		baseURL: 'http://127.0.0.1:4173',
		extraHTTPHeaders: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp'
		}
	},
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173 --host 127.0.0.1',
		url: 'http://127.0.0.1:4173/',
		timeout: 180_000,
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
