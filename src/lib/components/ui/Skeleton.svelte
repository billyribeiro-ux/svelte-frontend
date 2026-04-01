<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		width?: string;
		height?: string;
		rounded?: boolean;
		class?: string;
	}

	let { width = '100%', height = '1rem', rounded = false, class: className }: Props = $props();
</script>

<div
	class={cn('sf-skeleton', rounded && 'sf-skeleton--rounded', className)}
	style:inline-size={width}
	style:block-size={height}
	aria-hidden="true"
	role="presentation"
></div>

<style>
	.sf-skeleton {
		background: linear-gradient(
			90deg,
			var(--sf-bg-2) 25%,
			var(--sf-bg-3) 50%,
			var(--sf-bg-2) 75%
		);
		background-size: 200% 100%;
		animation: sf-shimmer 1.5s ease-in-out infinite;
		border-radius: var(--sf-radius-md);

		&.sf-skeleton--rounded {
			border-radius: var(--sf-radius-full);
		}
	}
</style>
