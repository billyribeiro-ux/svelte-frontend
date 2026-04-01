<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit';
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		children,
		onclick,
		class: className
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	class={cn('sf-btn', `sf-btn--${variant}`, `sf-btn--${size}`, className)}
	{onclick}
>
	{@render children()}
</button>

<style>
	.sf-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--sf-space-2);
		font-family: var(--sf-font-sans);
		font-weight: 500;
		border: 1px solid transparent;
		border-radius: var(--sf-radius-md);
		cursor: pointer;
		transition: all var(--sf-transition-fast);
		white-space: nowrap;
		user-select: none;
		line-height: 1;

		&:focus-visible {
			outline: 2px solid var(--sf-accent);
			outline-offset: 2px;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}

		/* Variants */
		&.sf-btn--primary {
			background: var(--sf-accent);
			color: var(--sf-accent-text);

			&:hover {
				background: var(--sf-accent-hover);
			}

			&:active {
				filter: brightness(0.9);
			}
		}

		&.sf-btn--secondary {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
			border-color: var(--sf-bg-4);

			&:hover {
				background: var(--sf-bg-4);
			}

			&:active {
				filter: brightness(0.9);
			}
		}

		&.sf-btn--ghost {
			background: transparent;
			color: var(--sf-text-1);

			&:hover {
				background: var(--sf-bg-2);
				color: var(--sf-text-0);
			}

			&:active {
				background: var(--sf-bg-3);
			}
		}

		&.sf-btn--destructive {
			background: var(--sf-error);
			color: var(--sf-accent-text);

			&:hover {
				filter: brightness(1.1);
			}

			&:active {
				filter: brightness(0.9);
			}
		}

		/* Sizes */
		&.sf-btn--sm {
			font-size: var(--sf-font-size-xs);
			padding-block: var(--sf-space-1);
			padding-inline: var(--sf-space-3);
			min-block-size: 28px;
		}

		&.sf-btn--md {
			font-size: var(--sf-font-size-sm);
			padding-block: var(--sf-space-2);
			padding-inline: var(--sf-space-4);
			min-block-size: 36px;
		}

		&.sf-btn--lg {
			font-size: var(--sf-font-size-base);
			padding-block: var(--sf-space-3);
			padding-inline: var(--sf-space-5);
			min-block-size: 44px;
		}
	}
</style>
