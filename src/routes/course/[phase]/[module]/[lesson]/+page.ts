import type { LessonData } from '$lib/types';

export async function load({ params }: { params: { phase: string; module: string; lesson: string } }) {
	try {
		const mod = await import(`$lib/data/lessons/${params.module}-${params.lesson}.ts`);
		return {
			lesson: mod.default as LessonData
		};
	} catch {
		// Return a placeholder if the lesson file doesn't exist yet
		const placeholder: LessonData = {
			meta: {
				id: `${params.module}-${params.lesson}`,
				title: `Lesson ${params.module}.${params.lesson}`,
				phase: Number(params.phase),
				module: Number(params.module),
				lessonIndex: Number(params.lesson)
			},
			description: 'This lesson is coming soon. Check back later for content.',
			objectives: ['Complete this lesson to continue your learning journey'],
			files: [
				{
					filename: 'App.svelte',
					content: '<h1>Coming Soon</h1>\n<p>This lesson is under construction.</p>',
					language: 'svelte'
				}
			]
		};
		return { lesson: placeholder };
	}
}
