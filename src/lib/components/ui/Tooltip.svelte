<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		children: Snippet;
		class?: string;
	}

	let { text, position = 'top', children, class: className }: Props = $props();
</script>

<span
	class={cn('sf-tooltip', `sf-tooltip--${position}`, className)}
	data-tooltip={text}
	aria-label={text}
>
	{@render children()}
</span>

<style>
	.sf-tooltip {
		position: relative;
		display: inline-flex;

		&::after {
			content: attr(data-tooltip);
			position: absolute;
			z-index: var(--sf-z-toast);
			font-family: var(--sf-font-sans);
			font-size: var(--sf-font-size-xs);
			font-weight: 400;
			line-height: 1.4;
			white-space: nowrap;
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
			border: 1px solid var(--sf-bg-4);
			border-radius: var(--sf-radius-sm);
			padding-block: var(--sf-space-1);
			padding-inline: var(--sf-space-2);
			box-shadow: var(--sf-shadow-md);
			pointer-events: none;
			opacity: 0;
			transition: opacity var(--sf-transition-fast);
		}

		&:hover::after,
		&:focus-within::after {
			opacity: 1;
		}

		/* Positions */
		&.sf-tooltip--top::after {
			inset-block-end: calc(100% + 6px);
			inset-inline-start: 50%;
			translate: -50% 0;
		}

		&.sf-tooltip--bottom::after {
			inset-block-start: calc(100% + 6px);
			inset-inline-start: 50%;
			translate: -50% 0;
		}

		&.sf-tooltip--left::after {
			inset-inline-end: calc(100% + 6px);
			inset-block-start: 50%;
			translate: 0 -50%;
		}

		&.sf-tooltip--right::after {
			inset-inline-start: calc(100% + 6px);
			inset-block-start: 50%;
			translate: 0 -50%;
		}
	}
</style>
