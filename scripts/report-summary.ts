#!/usr/bin/env tsx
/**
 * Reporter — reads the JSON reports from tests/reports/ and prints a neatly
 * aligned summary. Exits 0 unconditionally; this is not a gate.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const reportsDir = resolve(repoRoot, 'tests', 'reports');

function readJson<T = unknown>(name: string): T | null {
	const p = resolve(reportsDir, name);
	if (!existsSync(p)) return null;
	try {
		return JSON.parse(readFileSync(p, 'utf-8')) as T;
	} catch {
		return null;
	}
}

function pad(s: string, n: number): string {
	return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

interface AutofixerReport {
	totalIssues: number;
	pending?: boolean;
	entries?: unknown[];
}
interface AutofixerInput {
	length?: number;
}
interface PlaywrightReport {
	suites?: unknown[];
	stats?: { expected?: number; unexpected?: number; total?: number };
}
interface RoutesFetchReport {
	total: number;
	ok: number;
	failed: number;
}

function summarize(): void {
	console.log('');
	console.log('=== Test Summary ===');
	console.log('');

	// static / svelte-check
	console.log(`${pad('[static]', 14)}${pad('svelte-check', 20)}(see previous step)`);

	// mcp / autofixer
	const af = readJson<AutofixerReport>('autofixer.json');
	const afInput = readJson<unknown>('autofixer.input.json');
	const svelteCount = Array.isArray(afInput) ? afInput.length : 0;
	if (!af) {
		console.log(
			`${pad('[mcp]', 14)}${pad('svelte-autofixer', 20)}${pad(`${svelteCount} svelte`, 15)}(not run)`
		);
	} else if (af.pending) {
		console.log(
			`${pad('[mcp]', 14)}${pad('svelte-autofixer', 20)}${pad(`${svelteCount} svelte`, 15)}pending`
		);
	} else {
		console.log(
			`${pad('[mcp]', 14)}${pad('svelte-autofixer', 20)}${pad(`${svelteCount} svelte`, 15)}${af.totalIssues} issues`
		);
	}

	// playwright
	const pw = readJson<PlaywrightReport>('playwright.json');
	if (!pw) {
		console.log(`${pad('[e2e]', 14)}${pad('playwright', 20)}(not run)`);
	} else {
		const total = pw.stats?.total ?? pw.stats?.expected ?? 0;
		const failed = pw.stats?.unexpected ?? 0;
		console.log(
			`${pad('[e2e]', 14)}${pad('playwright', 20)}${pad(`${total} tests`, 15)}${failed} failed`
		);
	}

	// routes fetch fallback
	const rf = readJson<RoutesFetchReport>('routes-fetch.json');
	if (!rf) {
		console.log(`${pad('[e2e fetch]', 14)}${pad('routes', 20)}(not run)`);
	} else {
		console.log(
			`${pad('[e2e fetch]', 14)}${pad('routes', 20)}${pad(`${rf.total} urls`, 15)}${rf.failed} failed`
		);
	}

	console.log('');
}

summarize();
process.exit(0);
