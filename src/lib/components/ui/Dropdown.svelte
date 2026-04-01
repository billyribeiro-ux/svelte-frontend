<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		children: Snippet;
		items: Snippet;
		class?: string;
	}

	let { open = $bindable(false), children, items, class: className }: Props = $props();

	let dropdownEl: HTMLDivElement | undefined = $state();
	let triggerEl: HTMLButtonElement | undefined = $state();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
			triggerEl?.focus();
		}

		if (!open) return;

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!dropdownEl) return;
			const focusable = Array.from(
				dropdownEl.querySelectorAll<HTMLElement>(
					'.sf-dropdown-menu button, .sf-dropdown-menu a, .sf-dropdown-menu [tabindex]:not([tabindex="-1"])'
				)
			);
			const current = focusable.indexOf(document.activeElement as HTMLElement);
			let next: number;
			if (e.key === 'ArrowDown') {
				next = current < focusable.length - 1 ? current + 1 : 0;
			} else {
				next = current > 0 ? current - 1 : focusable.length - 1;
			}
			focusable[next]?.focus();
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			// Assign role="menuitem" to all interactive children in the menu
			if (dropdownEl) {
				const items = dropdownEl.querySelectorAll('.sf-dropdown-menu button, .sf-dropdown-menu a');
				items.forEach((el) => el.setAttribute('role', 'menuitem'));
			}
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={cn('sf-dropdown', className)}
	bind:this={dropdownEl}
	onkeydown={handleKeydown}
>
	<button
		class="sf-dropdown-trigger"
		type="button"
		aria-haspopup="true"
		aria-expanded={open}
		onclick={() => (open = !open)}
		bind:this={triggerEl}
	>
		{@render children()}
	</button>
	{#if open}
		<div class="sf-dropdown-menu" role="menu" tabindex="-1">
			<!-- items should use role="menuitem" -->
			{@render items()}
		</div>
	{/if}
</div>

<style>
	.sf-dropdown {
		position: relative;
		display: inline-flex;
	}

	.sf-dropdown-trigger {
		display: inline-flex;
	}

	.sf-dropdown-menu {
		position: absolute;
		z-index: var(--sf-z-dropdown);
		inset-block-start: calc(100% + var(--sf-space-1));
		inset-inline-start: 0;
		min-inline-size: 180px;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-md);
		box-shadow: var(--sf-shadow-lg);
		padding-block: var(--sf-space-1);
		animation: sf-scale-in var(--sf-transition-fast);
		outline: none;

		& :global(button),
		& :global(a) {
			display: flex;
			align-items: center;
			gap: var(--sf-space-2);
			inline-size: 100%;
			font-family: var(--sf-font-sans);
			font-size: var(--sf-font-size-sm);
			color: var(--sf-text-1);
			background: transparent;
			border: none;
			padding-block: var(--sf-space-2);
			padding-inline: var(--sf-space-3);
			cursor: pointer;
			text-align: start;
			text-decoration: none;
			transition: background var(--sf-transition-fast), color var(--sf-transition-fast);

			&:hover,
			&:focus-visible {
				background: var(--sf-bg-2);
				color: var(--sf-text-0);
				outline: none;
			}
		}
	}
</style>
