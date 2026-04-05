#!/usr/bin/env tsx
/**
 * Standalone node-fetch fallback smoke test.
 * - Boots `pnpm preview` on 127.0.0.1:4173 (runs `pnpm build` first if the build dir is missing).
 * - Polls until the server is live.
 * - Fetches "/" and every lesson URL; asserts ok() and non-empty <title>.
 * - Writes a summary to tests/reports/routes-fetch.json.
 * - Exits 0 on success, 1 on any failure.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { course } from '../../src/lib/data/curriculum';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const reportsDir = resolve(repoRoot, 'tests', 'reports');
const reportPath = resolve(reportsDir, 'routes-fetch.json');

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE = `http://${HOST}:${PORT}`;

interface Failure {
	url: string;
	reason: string;
}
const failures: Failure[] = [];
let okCount = 0;

interface FlatLesson {
	id: string;
	url: string;
	title: string;
}
const lessons: FlatLesson[] = course.phases.flatMap((phase) =>
	phase.modules.flatMap((module) =>
		module.lessons.map((lesson) => ({
			id: lesson.id,
			url: `/course/${phase.index}/${module.index}/${lesson.lessonIndex}`,
			title: lesson.title
		}))
	)
);

let preview: ChildProcess | null = null;

function log(msg: string): void {
	process.stdout.write(`${msg}\n`);
}

function killPreview(): void {
	if (preview && !preview.killed) {
		try {
			preview.kill('SIGTERM');
		} catch {
			// ignore
		}
	}
}

function ensureBuild(): void {
	const buildDir = resolve(repoRoot, '.svelte-kit', 'output');
	if (!existsSync(buildDir)) {
		log('[routes-fetch] no build found — running `pnpm build`...');
		const r = spawnSync('pnpm', ['build'], { cwd: repoRoot, stdio: 'inherit' });
		if (r.status !== 0) {
			log('[routes-fetch] pnpm build failed');
			process.exit(1);
		}
	}
}

function startPreview(): void {
	log(`[routes-fetch] starting preview on ${BASE} ...`);
	const proc: ChildProcess = spawn('pnpm', ['preview', '--port', String(PORT), '--host', HOST], {
		cwd: repoRoot,
		stdio: ['ignore', 'pipe', 'pipe'],
		detached: false
	});
	preview = proc;
	proc.stdout?.on('data', () => {
		/* swallow */
	});
	proc.stderr?.on('data', () => {
		/* swallow */
	});
	proc.on('exit', (code: number | null) => {
		if (code !== null && code !== 0) {
			log(`[routes-fetch] preview exited unexpectedly with code ${code}`);
		}
	});
}

async function waitForServer(timeoutMs = 30_000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(`${BASE}/`);
			if (res.ok) {
				log('[routes-fetch] server is up');
				return;
			}
		} catch {
			// not ready yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(`preview did not become ready within ${timeoutMs}ms`);
}

async function checkUrl(path: string, label: string, index: number, total: number): Promise<void> {
	const url = `${BASE}${path}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			failures.push({ url: path, reason: `status ${res.status}` });
			log(`[${String(index).padStart(3, '0')}/${total}] FAIL ${path} — status ${res.status}`);
			return;
		}
		const body = await res.text();
		const match = body.match(/<title>([^<]*)<\/title>/i);
		if (!match || match[1].trim().length === 0) {
			failures.push({ url: path, reason: 'missing or empty <title>' });
			log(`[${String(index).padStart(3, '0')}/${total}] FAIL ${path} — no <title>`);
			return;
		}
		okCount++;
		log(`[${String(index).padStart(3, '0')}/${total}] OK   ${path} — ${match[1].trim()}`);
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		failures.push({ url: path, reason });
		log(`[${String(index).padStart(3, '0')}/${total}] FAIL ${path} — ${reason}`);
	}
}

function writeReport(): void {
	mkdirSync(reportsDir, { recursive: true });
	const total = lessons.length + 1; // +1 for landing
	const report = {
		total,
		ok: okCount,
		failed: failures.length,
		failures
	};
	writeFileSync(reportPath, JSON.stringify(report, null, 2));
	log(`[routes-fetch] wrote ${reportPath}`);
}

async function main(): Promise<void> {
	ensureBuild();
	startPreview();

	try {
		await waitForServer();
	} catch (err) {
		log(`[routes-fetch] ${err instanceof Error ? err.message : String(err)}`);
		killPreview();
		writeReport();
		process.exit(1);
	}

	const total = lessons.length + 1;

	// Landing
	await checkUrl('/', 'landing', 1, total);

	for (let i = 0; i < lessons.length; i++) {
		await checkUrl(lessons[i].url, lessons[i].title, i + 2, total);
	}

	writeReport();
	killPreview();

	if (failures.length > 0) {
		log(`[routes-fetch] FAILED — ${failures.length} failure(s)`);
		process.exit(1);
	}
	log(`[routes-fetch] OK — ${okCount}/${total} urls passed`);
	process.exit(0);
}

process.on('SIGINT', () => {
	killPreview();
	process.exit(130);
});
process.on('SIGTERM', () => {
	killPreview();
	process.exit(143);
});

main().catch((err) => {
	log(`[routes-fetch] unexpected error: ${err instanceof Error ? err.stack : String(err)}`);
	killPreview();
	writeReport();
	process.exit(1);
});
