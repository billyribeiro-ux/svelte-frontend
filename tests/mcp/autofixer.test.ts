import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(__dirname, '..', 'reports', 'autofixer.json');

interface AutofixerReport {
	totalIssues: number;
	pending?: boolean;
	entries?: unknown[];
}

describe('svelte autofixer gate', () => {
	if (!existsSync(reportPath)) {
		it.skip('autofixer report not yet generated', () => {
			// Driving agent has not populated tests/reports/autofixer.json yet.
		});
		return;
	}

	const report: AutofixerReport = JSON.parse(readFileSync(reportPath, 'utf-8'));

	if (report.pending) {
		it.skip('autofixer report pending — driving agent has not run MCP loop yet', () => {
			// no-op
		});
		return;
	}

	it('reports zero remaining svelte issues', () => {
		expect(report.totalIssues).toBe(0);
	});
});
