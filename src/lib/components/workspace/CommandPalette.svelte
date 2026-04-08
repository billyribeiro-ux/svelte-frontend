<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut, expoOut } from 'svelte/easing';
	import { workspace } from '$stores/workspace.svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '$components/ui/Icon.svelte';

	interface CommandItem {
		id: string;
		label: string;
		category: string;
		icon: string;
		action: () => void;
	}

	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement | null = $state(null);

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 300);

	const commands: CommandItem[] = [
		{ id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: 'ph:house', action: () => goto('/dashboard') },
		{ id: 'nav-learn', label: 'Browse Tracks', category: 'Navigation', icon: 'ph:book-open', action: () => goto('/learn') },
		{ id: 'nav-graph', label: 'Concept Graph', category: 'Navigation', icon: 'ph:graph', action: () => goto('/learn/graph') },
		{ id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: 'ph:gear', action: () => goto('/settings') },
		{ id: 'toggle-lesson', label: 'Toggle Lesson Panel', category: 'Workspace', icon: 'ph:sidebar-simple', action: () => workspace.togglePanel('lesson') },
		{ id: 'toggle-preview', label: 'Toggle Preview Panel', category: 'Workspace', icon: 'ph:browser', action: () => workspace.togglePanel('preview') },
		{ id: 'toggle-bottom', label: 'Toggle Bottom Panel', category: 'Workspace', icon: 'ph:rows', action: () => workspace.togglePanel('bottom') },
		{ id: 'tab-console', label: 'Show Console', category: 'Workspace', icon: 'ph:terminal', action: () => workspace.setBottomTab('console') },
		{ id: 'tab-xray', label: 'Show X-Ray', category: 'Workspace', icon: 'ph:eye', action: () => workspace.setBottomTab('xray') },
		{ id: 'tab-tutor', label: 'Show AI Tutor', category: 'Workspace', icon: 'ph:robot', action: () => workspace.setBottomTab('tutor') },
		{ id: 'reset-layout', label: 'Reset Layout', category: 'Workspace', icon: 'ph:layout', action: () => workspace.resetLayout() },

		// Lesson shortcuts
		{ id: 'lesson-state', label: 'Lesson: Understanding $state', category: 'Lessons', icon: 'ph:code', action: () => goto('/learn/svelte-core/runes-reactivity/state-basics') },
		{ id: 'lesson-derived', label: 'Lesson: Derived Values', category: 'Lessons', icon: 'ph:code', action: () => goto('/learn/svelte-core/runes-reactivity/derived-values') },
		{ id: 'lesson-first', label: 'Lesson: Your First Component', category: 'Lessons', icon: 'ph:code', action: () => goto('/learn/svelte-core/svelte-basics/your-first-component') },
	];

	let filtered = $derived.by(() => {
		if (!query) return commands;
		const q = query.toLowerCase();
		return commands.filter(
			(c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
		);
	});

	$effect(() => {
		if (isOpen && inputEl) {
			inputEl.focus();
		}
	});

	$effect(() => {
		// Reset selection when filter changes
		if (filtered) selectedIndex = 0;
	});

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			isOpen = !isOpen;
			query = '';
			selectedIndex = 0;
		}

		if (!isOpen) return;

		if (e.key === 'Escape') {
			isOpen = false;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && filtered[selectedIndex]) {
			e.preventDefault();
			executeCommand(filtered[selectedIndex]!);
		}
	}

	function executeCommand(cmd: CommandItem) {
		isOpen = false;
		query = '';
		cmd.action();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={() => isOpen = false} transition:fade={{ duration: inDuration, easing: cubicOut }}>
		<div 
			class="palette" 
			onclick={(e) => e.stopPropagation()}
			in:scale={{ start: 0.95, duration: inDuration, easing: expoOut, opacity: 0 }}
			out:scale={{ start: 0.98, duration: 200, easing: cubicOut, opacity: 0 }}
			role="dialog" aria-label="Command palette" tabindex="-1"
		>
			<div class="palette-input-wrap">
				<Icon icon="ph:magnifying-glass" size={16} />
				<input
					bind:this={inputEl}
					bind:value={query}
					class="palette-input"
					placeholder="Search commands, lessons, navigation..."
					type="text"
				/>
				<kbd class="palette-hint">ESC</kbd>
			</div>

			<div class="palette-results">
				{#if filtered.length === 0}
					<div class="palette-empty">No results for "{query}"</div>
				{:else}
					{@const categories = [...new Set(filtered.map((c) => c.category))]}
					{#each categories as category}
						<div class="palette-category">{category}</div>
						{#each filtered.filter((c) => c.category === category) as cmd, i}
							{@const globalIndex = filtered.indexOf(cmd)}
							<button
								class="palette-item"
								class:selected={globalIndex === selectedIndex}
								onclick={() => executeCommand(cmd)}
								onmouseenter={() => selectedIndex = globalIndex}
							>
								<Icon icon={cmd.icon} size={16} />
								<span class="item-label">{cmd.label}</span>
							</button>
						{/each}
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.5);
		z-index: var(--sf-z-command-palette);
		display: flex;
		justify-content: center;
		padding-block-start: 15vh;
		animation: sf-fade-in 200ms var(--sf-ease-out);
		backdrop-filter: blur(4px);
	}

	.palette {
		inline-size: min(560px, 90vw);
		max-block-size: 420px;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		box-shadow: var(--sf-shadow-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: sf-scale-in 250ms var(--sf-ease-out);
	}

	.palette-input-wrap {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-3) var(--sf-space-4);
		border-block-end: 1px solid var(--sf-bg-3);
		color: var(--sf-text-2);
	}

	.palette-input {
		flex: 1;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		color: var(--sf-text-0);
		background: none;
		border: none;
		outline: none;
	}

	.palette-hint {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		background: var(--sf-bg-3);
		padding: 1px 6px;
		border-radius: var(--sf-radius-sm);
	}

	.palette-results {
		overflow-y: auto;
		padding: var(--sf-space-2);
	}

	.palette-empty {
		padding: var(--sf-space-4);
		text-align: center;
		color: var(--sf-text-3);
		font-size: var(--sf-font-size-sm);
	}

	.palette-category {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: var(--sf-space-2) var(--sf-space-3);
		padding-block-start: var(--sf-space-3);
	}

	.palette-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		inline-size: 100%;
		padding: var(--sf-space-2) var(--sf-space-3);
		border-radius: var(--sf-radius-md);
		color: var(--sf-text-1);
		font-size: var(--sf-font-size-sm);
		text-align: start;
		transition: background var(--sf-transition-fast);

		&.selected {
			background: var(--sf-accent-subtle);
			color: var(--sf-accent);
		}
	}

	.item-label {
		flex: 1;
	}
</style>
