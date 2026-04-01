<script lang="ts">
	import type { SEOData } from '$types/seo';
	import JsonLd from './JsonLd.svelte';

	interface Props {
		seo: SEOData;
	}

	let { seo }: Props = $props();

	let title = $derived(seo.title ? `${seo.title} | SvelteForge` : 'SvelteForge');
	let robots = $derived.by(() => {
		const directives: string[] = [];
		if (seo.noindex) directives.push('noindex');
		else directives.push('index');
		if (seo.nofollow) directives.push('nofollow');
		else directives.push('follow');
		return directives.join(', ');
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={seo.description} />
	<meta name="robots" content={robots} />

	{#if seo.canonical}
		<link rel="canonical" href={seo.canonical} />
	{/if}

	<!-- Open Graph -->
	{#if seo.og}
		<meta property="og:title" content={seo.og.title ?? seo.title} />
		<meta property="og:description" content={seo.og.description ?? seo.description} />
		<meta property="og:type" content={seo.og.type ?? 'website'} />
		{#if seo.og.url}
			<meta property="og:url" content={seo.og.url} />
		{/if}
		{#if seo.og.image}
			<meta property="og:image" content={seo.og.image} />
			{#if seo.og.imageWidth}
				<meta property="og:image:width" content={String(seo.og.imageWidth)} />
			{/if}
			{#if seo.og.imageHeight}
				<meta property="og:image:height" content={String(seo.og.imageHeight)} />
			{/if}
		{/if}
		<meta property="og:locale" content={seo.og.locale ?? 'en_US'} />
		<meta property="og:site_name" content={seo.og.siteName ?? 'SvelteForge'} />
	{/if}

	<!-- Twitter Card -->
	{#if seo.twitter}
		<meta name="twitter:card" content={seo.twitter.card ?? 'summary_large_image'} />
		<meta name="twitter:title" content={seo.twitter.title ?? seo.title} />
		<meta name="twitter:description" content={seo.twitter.description ?? seo.description} />
		{#if seo.twitter.image}
			<meta name="twitter:image" content={seo.twitter.image} />
		{/if}
		{#if seo.twitter.creator}
			<meta name="twitter:creator" content={seo.twitter.creator} />
		{/if}
	{/if}

	<!-- JSON-LD Structured Data -->
	{#if seo.jsonLd}
		{#if Array.isArray(seo.jsonLd)}
			{#each seo.jsonLd as schema}
				<JsonLd data={schema} />
			{/each}
		{:else}
			<JsonLd data={seo.jsonLd} />
		{/if}
	{/if}
</svelte:head>
