<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title: string;
		children: Snippet;
		class?: string;
	}

	let { open = $bindable(false), title, children, class: className }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();
	let previousFocus: HTMLElement | null = null;

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}

		/* Focus trap */
		if (e.key === 'Tab' && dialogEl) {
			const focusable = dialogEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			close();
		}
	}

	$effect(() => {
		if (open) {
			previousFocus = document.activeElement as HTMLElement;
			dialogEl?.showModal();
		} else {
			dialogEl?.close();
			previousFocus?.focus();
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
<dialog
	bind:this={dialogEl}
	class={cn('sf-dialog', className)}
	aria-labelledby="sf-dialog-title"
	onkeydown={handleKeydown}
	onclick={handleBackdropClick}
>
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div class="sf-dialog-content" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
		<header class="sf-dialog-header">
			<h2 class="sf-dialog-title" id="sf-dialog-title">{title}</h2>
			<button
				class="sf-dialog-close"
				type="button"
				aria-label="Close dialog"
				onclick={close}
			>
				&#x2715;
			</button>
		</header>
		<div class="sf-dialog-body">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.sf-dialog {
		position: fixed;
		inset: 0;
		z-index: var(--sf-z-modal);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		padding: var(--sf-space-4);
		max-inline-size: 100vw;
		max-block-size: 100vh;
		inline-size: 100%;
		block-size: 100%;

		&::backdrop {
			background: oklch(0 0 0 / 0.6);
			backdrop-filter: blur(4px);
		}

		&[open] {
			animation: sf-fade-in var(--sf-transition-base);
		}

		&[open] .sf-dialog-content {
			animation: sf-scale-in var(--sf-transition-base);
		}
	}

	.sf-dialog-content {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		box-shadow: var(--sf-shadow-lg);
		max-inline-size: 480px;
		inline-size: 100%;
		max-block-size: 80vh;
		overflow-y: auto;
	}

	.sf-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: var(--sf-space-4);
		padding-inline: var(--sf-space-5);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.sf-dialog-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.sf-dialog-close {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		background: transparent;
		border: none;
		border-radius: var(--sf-radius-sm);
		color: var(--sf-text-2);
		font-size: var(--sf-font-size-base);
		cursor: pointer;
		transition: background var(--sf-transition-fast), color var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
		}

		&:focus-visible {
			outline: 2px solid var(--sf-accent);
			outline-offset: 2px;
		}
	}

	.sf-dialog-body {
		padding: var(--sf-space-5);
	}
</style>
