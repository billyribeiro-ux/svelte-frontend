import { course } from '$data/curriculum';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const baseUrl = 'https://svelte-pe7-mastery.com';

	const urls: string[] = ['/'];

	for (const phase of course.phases) {
		for (const mod of phase.modules) {
			for (const lesson of mod.lessons) {
				urls.push(`/course/${lesson.phase}/${lesson.module}/${lesson.lessonIndex}`);
			}
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${baseUrl}${url}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
