<script lang="ts">
	interface Props {
		conceptId: string;
	}

	let { conceptId }: Props = $props();

	let label = $derived(conceptId.split('.').pop() ?? conceptId);
</script>

<span class="concept-tag" title={conceptId}>
	{label}
</span>

<style>
	.concept-tag {
		display: inline-flex;
		align-items: center;
		padding: var(--sf-space-1) var(--sf-space-3);
		margin: var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		color: var(--sf-accent);
		background: var(--sf-accent-subtle);
		border-radius: var(--sf-radius-full);
		cursor: help;
	}
</style>
