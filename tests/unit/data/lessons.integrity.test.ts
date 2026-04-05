import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { LessonData } from '../../../src/lib/types/index';

// ─────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────

const LessonFileSchema = z.object({
	filename: z.string().min(1),
	content: z.string(), // may be empty for starter templates
	language: z.enum(['svelte', 'typescript', 'javascript', 'html', 'css', 'json'])
});

const LessonMetaSchema = z.object({
	id: z.string().regex(/^\d+-\d+$/),
	title: z.string().min(1),
	phase: z.number().int().positive(),
	module: z.number().int().nonnegative(),
	lessonIndex: z.number().int().positive()
});

const LessonDataSchema = z.object({
	meta: LessonMetaSchema,
	description: z.string().min(1),
	objectives: z.array(z.string().min(1)),
	files: z.array(LessonFileSchema).min(1),
	solution: z.array(LessonFileSchema).optional()
});

// ─────────────────────────────────────────────────────────────────────
// Load all lessons eagerly
// ─────────────────────────────────────────────────────────────────────

const lessonModules = import.meta.glob('../../../src/lib/data/lessons/*.ts', {
	eager: true
}) as Record<string, { default: LessonData }>;

interface LoadedLesson {
	filename: string; // e.g. "8-3"
	modulePath: string;
	data: LessonData;
}

const loaded: LoadedLesson[] = Object.entries(lessonModules).map(([path, mod]) => {
	const base = path.split('/').pop() as string;
	return {
		filename: base.replace(/\.ts$/, ''),
		modulePath: path,
		data: mod.default
	};
});

describe('lesson integrity', () => {
	it('loaded at least one lesson', () => {
		expect(loaded.length).toBeGreaterThan(0);
	});

	describe.each(loaded.map((l) => [l.filename, l]))('lesson %s', (_name, lesson) => {
		const { filename, data } = lesson as LoadedLesson;

		it('has a default export matching LessonDataSchema', () => {
			const result = LessonDataSchema.safeParse(data);
			if (!result.success) {
				// Surface full error so the failure points at the specific lesson.
				throw new Error(
					`Schema validation failed for ${filename}.ts:\n${JSON.stringify(result.error.format(), null, 2)}`
				);
			}
			expect(result.success).toBe(true);
		});

		it('meta.id matches the filename', () => {
			expect(data.meta.id).toBe(filename);
		});

		it('meta.id module prefix matches meta.module', () => {
			const [modStr] = filename.split('-');
			expect(data.meta.module).toBe(Number(modStr));
		});

		it('has at least one file', () => {
			expect(data.files.length).toBeGreaterThanOrEqual(1);
		});

		it('first file is typically App.svelte (soft check)', () => {
			// Not strictly required — just surfaces surprises if ever different.
			const hasApp = data.files.some((f) => f.filename === 'App.svelte');
			expect(hasApp).toBe(true);
		});

		it('respects the script tag boundary rule (module < 8 → plain <script>, module ≥ 8 → <script lang="ts">)', () => {
			const [modStr] = filename.split('-');
			const moduleNum = Number(modStr);

			for (const file of data.files) {
				if (file.language !== 'svelte') continue;
				if (!/<script\b/.test(file.content)) continue;

				const hasLangTs = /<script[^>]*\blang=["']ts["']/.test(file.content);

				if (moduleNum < 8) {
					// Modules 0-7 should use plain <script> (no lang="ts")
					expect(
						hasLangTs,
						`${filename}.ts file ${file.filename} uses <script lang="ts"> but module ${moduleNum} is < 8`
					).toBe(false);
				} else {
					// Modules 8+ must use <script lang="ts">
					expect(
						hasLangTs,
						`${filename}.ts file ${file.filename} is missing <script lang="ts"> (module ${moduleNum} >= 8)`
					).toBe(true);
				}
			}
		});
	});
});
