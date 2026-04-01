export interface SEOData {
	title: string;
	description: string;
	canonical?: string;
	noindex?: boolean;
	nofollow?: boolean;
	og?: OpenGraphData;
	twitter?: TwitterCardData;
	jsonLd?: JsonLdSchema | JsonLdSchema[];
	breadcrumbs?: BreadcrumbItem[];
}

export interface OpenGraphData {
	title?: string;
	description?: string;
	image?: string;
	imageWidth?: number;
	imageHeight?: number;
	url?: string;
	type?: 'website' | 'article' | 'profile';
	locale?: string;
	siteName?: string;
}

export interface TwitterCardData {
	card?: 'summary' | 'summary_large_image';
	title?: string;
	description?: string;
	image?: string;
	creator?: string;
	site?: string;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export type JsonLdSchema = Record<string, unknown>;
