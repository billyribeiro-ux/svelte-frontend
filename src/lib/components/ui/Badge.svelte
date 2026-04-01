<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
		children: Snippet;
		class?: string;
	}

	let { variant = 'default', children, class: className }: Props = $props();
</script>

<span class={cn('sf-badge', `sf-badge--${variant}`, className)} role="status">
	{@render children()}
</span>

<style>
	.sf-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		line-height: 1;
		padding-block: var(--sf-space-1);
		padding-inline: var(--sf-space-2);
		border-radius: var(--sf-radius-full);
		white-space: nowrap;

		&.sf-badge--default {
			background: var(--sf-bg-3);
			color: var(--sf-text-1);
		}

		&.sf-badge--success {
			background: oklch(0.72 0.19 155 / 0.15);
			color: var(--sf-success);
		}

		&.sf-badge--warning {
			background: oklch(0.78 0.18 75 / 0.15);
			color: var(--sf-warning);
		}

		&.sf-badge--error {
			background: oklch(0.65 0.22 25 / 0.15);
			color: var(--sf-error);
		}

		&.sf-badge--info {
			background: oklch(0.7 0.15 230 / 0.15);
			color: var(--sf-info);
		}
	}
</style>
