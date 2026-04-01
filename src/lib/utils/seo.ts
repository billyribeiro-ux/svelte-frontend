import type { JsonLdSchema, BreadcrumbItem } from '$types/seo';

export function buildWebsiteSchema(url: string): JsonLdSchema {
	return {
		'@type': 'WebSite',
		name: 'SvelteForge',
		url,
		description: 'The definitive Svelte 5 & SvelteKit interactive learning platform',
		potentialAction: {
			'@type': 'SearchAction',
			target: `${url}/learn?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	};
}

export function buildOrganizationSchema(url: string): JsonLdSchema {
	return {
		'@type': 'Organization',
		name: 'SvelteForge',
		url,
		logo: `${url}/logo.png`,
		sameAs: []
	};
}

export function buildCourseSchema(
	url: string,
	title: string,
	description: string
): JsonLdSchema {
	return {
		'@type': 'Course',
		name: title,
		description,
		provider: {
			'@type': 'Organization',
			name: 'SvelteForge'
		},
		url,
		educationalLevel: 'Beginner to Advanced',
		programmingLanguage: ['Svelte', 'TypeScript', 'HTML', 'CSS'],
		teaches: ['Svelte 5', 'SvelteKit', 'TypeScript', 'Modern CSS', 'Web Development']
	};
}

export function buildLearningResourceSchema(
	url: string,
	title: string,
	description: string,
	concepts: string[]
): JsonLdSchema {
	return {
		'@type': 'LearningResource',
		name: title,
		description,
		url,
		learningResourceType: 'Interactive lesson',
		educationalLevel: 'Intermediate',
		teaches: concepts
	};
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdSchema {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}
