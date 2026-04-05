#!/usr/bin/env tsx
/**
 * Builds the autofixer input manifest: every svelte file embedded in every lesson.
 * Output:
 *   - tests/reports/autofixer.input.json: manifest array of { lessonId, filename, contents }
 *   - tests/reports/autofixer.json: { totalIssues: -1, pending: true, entries: [] }
 *     (the gate test treats pending:true or missing file as "not yet run")
 *
 * The MCP autofixer loop is driven externally; this runner only prepares inputs.
 */
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const lessonsDir = resolve(repoRoot, 'src', 'lib', 'data', 'lessons');
const reportsDir = resolve(repoRoot, 'tests', 'reports');

interface LessonFile {
	filename: string;
	content: string;
	language: string;
}
interface LessonMeta {
	id: string;
}
interface LessonData {
	meta: LessonMeta;
	files: LessonFile[];
}
interface ManifestEntry {
	lessonId: string;
	filename: string;
	contents: string;
}

async function main(): Promise<void> {
	const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.ts'));
	files.sort();

	const manifest: ManifestEntry[] = [];
	let lessonCount = 0;

	for (const file of files) {
		const absPath = resolve(lessonsDir, file);
		const mod = (await import(pathToFileURL(absPath).href)) as Record<string, unknown>;

		// Find the exported LessonData — default export or any named export with .files
		let lesson: LessonData | null = null;
		if (mod.default && isLessonData(mod.default)) {
			lesson = mod.default as LessonData;
		} else {
			for (const key of Object.keys(mod)) {
				if (isLessonData(mod[key])) {
					lesson = mod[key] as LessonData;
					break;
				}
			}
		}
		if (!lesson) {
			console.warn(`[autofixer] skipping ${file}: no LessonData export found`);
			continue;
		}
		lessonCount++;

		for (const lf of lesson.files) {
			if (lf.language === 'svelte') {
				manifest.push({
					lessonId: lesson.meta.id,
					filename: lf.filename,
					contents: lf.content
				});
			}
		}
	}

	mkdirSync(reportsDir, { recursive: true });
	const inputPath = resolve(reportsDir, 'autofixer.input.json');
	writeFileSync(inputPath, JSON.stringify(manifest, null, 2));

	const gatePath = resolve(reportsDir, 'autofixer.json');
	writeFileSync(
		gatePath,
		JSON.stringify({ totalIssues: -1, pending: true, entries: [] }, null, 2)
	);

	console.log(`[autofixer] scanned ${lessonCount} lesson files`);
	console.log(`[autofixer] found ${manifest.length} svelte files`);
	console.log(`[autofixer] wrote manifest -> ${inputPath}`);
	console.log(`[autofixer] wrote pending gate -> ${gatePath}`);
}

function isLessonData(v: unknown): v is LessonData {
	if (!v || typeof v !== 'object') return false;
	const obj = v as Record<string, unknown>;
	return (
		'meta' in obj &&
		'files' in obj &&
		Array.isArray((obj as { files: unknown }).files)
	);
}

main().catch((err) => {
	console.error('[autofixer] runner failed:', err);
	process.exit(1);
});
