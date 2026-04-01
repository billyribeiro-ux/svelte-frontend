<script lang="ts">
	import type { JsonLdSchema } from '$types/seo';
	import { untrack } from 'svelte';

	interface Props {
		data: JsonLdSchema;
	}

	let { data }: Props = $props();

	let json = $derived(JSON.stringify({ '@context': 'https://schema.org', ...data }, null, 0));
</script>

<svelte:head>
	<script type="application/ld+json">
		{untrack(() => json)}
	</script>
</svelte:head>
