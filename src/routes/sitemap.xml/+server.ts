import type { RequestHandler } from './$types';
import { initLessons } from '$lessons/init';
import { getAllTracks } from '$lessons/registry';

export const GET: RequestHandler = async ({ url }) => {
	initLessons();
	const baseUrl = url.origin;
	const tracks = getAllTracks();

	const urls: string[] = [
		baseUrl,
		`${baseUrl}/learn`,
		`${baseUrl}/learn/graph`
	];

	for (const track of tracks) {
		urls.push(`${baseUrl}/learn/${track.slug}`);
		for (const mod of track.modules) {
			urls.push(`${baseUrl}/learn/${track.slug}/${mod.slug}`);
			for (const lesson of mod.lessons) {
				urls.push(`${baseUrl}/learn/${track.slug}/${mod.slug}/${lesson.slug}`);
			}
		}
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
