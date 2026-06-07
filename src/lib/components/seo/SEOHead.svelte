<script lang="ts">
	let {
		title = '',
		description = '',
		url = '',
		image = '/og-default.png'
	}: {
		title?: string;
		description?: string;
		url?: string;
		image?: string;
	} = $props();

	const fullTitle = $derived(title ? `${title} | Svelte PE7 Mastery` : 'Svelte PE7 Mastery');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title || 'Svelte PE7 Mastery'} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={image} />
	{#if url}
		<meta property="og:url" content={url} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title || 'Svelte PE7 Mastery'} />
</svelte:head>
