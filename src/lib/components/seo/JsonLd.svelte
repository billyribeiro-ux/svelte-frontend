<script lang="ts">
	import type { JsonLdSchema } from '$types/seo';

	interface Props {
		data: JsonLdSchema;
	}

	let { data }: Props = $props();

	let json = $derived(JSON.stringify({ '@context': 'https://schema.org', ...data }));
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${json}</script>`}
</svelte:head>
