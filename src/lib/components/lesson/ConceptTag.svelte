<script lang="ts">
	interface Props {
		conceptId: string;
	}

	let { conceptId }: Props = $props();

	let label = $derived(
		conceptId
			.split('.')
			.pop()
			?.replace(/-/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase()) ?? conceptId
	);

	let href = $derived(`/learn/graph?concept=${encodeURIComponent(conceptId)}`);
</script>

<a {href} class="concept-tag" title="View in Concept Graph: {conceptId}">
	<span class="concept-dot"></span>
	{label}
</a>

<style>
	.concept-tag {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-1) var(--sf-space-3);
		margin: var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		color: var(--sf-accent);
		background: var(--sf-accent-subtle);
		border-radius: var(--sf-radius-full);
		text-decoration: none;
		transition: background var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&:hover {
			background: var(--sf-accent);
			color: var(--sf-accent-text);
			box-shadow: var(--sf-shadow-sm);
		}
	}

	.concept-dot {
		inline-size: 6px;
		block-size: 6px;
		border-radius: var(--sf-radius-full);
		background: currentColor;
		flex-shrink: 0;
	}
</style>
