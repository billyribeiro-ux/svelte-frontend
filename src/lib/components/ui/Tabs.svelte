<script lang="ts">
	import { cn } from '$utils/cn';
	import type { Snippet } from 'svelte';

	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		children: Snippet;
		class?: string;
	}

	let { tabs, activeTab = $bindable(''), children, class: className }: Props = $props();

	let tablistEl: HTMLElement | undefined = $state();

	function handleKeydown(e: KeyboardEvent) {
		if (!tablistEl) return;
		const buttons = Array.from(tablistEl.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
		const currentIndex = buttons.findIndex((btn) => btn.getAttribute('aria-selected') === 'true');

		if (buttons.length === 0) return;

		let nextIndex = currentIndex;
		if (e.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % buttons.length;
		} else if (e.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
		} else if (e.key === 'Home') {
			nextIndex = 0;
		} else if (e.key === 'End') {
			nextIndex = buttons.length - 1;
		} else {
			return;
		}

		e.preventDefault();
		buttons[nextIndex]?.focus();
		const tab = tabs[nextIndex];
		if (tab) activeTab = tab.id;
	}
</script>

<div class={cn('sf-tabs', className)}>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div class="sf-tabs-list" role="tablist" bind:this={tablistEl} onkeydown={handleKeydown}>
		{#each tabs as tab (tab.id)}
			<button
				role="tab"
				id={`tab-${tab.id}`}
				class="sf-tabs-trigger"
				class:sf-tabs-trigger--active={activeTab === tab.id}
				aria-selected={activeTab === tab.id}
				aria-controls={`tabpanel-${tab.id}`}
				tabindex={activeTab === tab.id ? 0 : -1}
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div
		class="sf-tabs-content"
		role="tabpanel"
		id={`tabpanel-${activeTab}`}
		aria-labelledby={`tab-${activeTab}`}
		tabindex={0}
	>
		{@render children()}
	</div>
</div>

<style>
	.sf-tabs {
		display: flex;
		flex-direction: column;
	}

	.sf-tabs-list {
		display: flex;
		border-block-end: 1px solid var(--sf-bg-3);
		gap: var(--sf-space-1);
	}

	.sf-tabs-trigger {
		position: relative;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-2);
		background: transparent;
		border: none;
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		cursor: pointer;
		transition: color var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-0);
		}

		&:focus-visible {
			outline: 2px solid var(--sf-accent);
			outline-offset: -2px;
			border-radius: var(--sf-radius-sm);
		}

		&::after {
			content: '';
			position: absolute;
			inset-block-end: -1px;
			inset-inline: 0;
			block-size: 2px;
			background: transparent;
			border-radius: var(--sf-radius-full);
			transition: background var(--sf-transition-fast);
		}

		&.sf-tabs-trigger--active {
			color: var(--sf-accent);

			&::after {
				background: var(--sf-accent);
			}
		}
	}

	.sf-tabs-content {
		padding-block-start: var(--sf-space-4);
	}
</style>
