<script lang="ts">
	import type { LessonFile } from '$lib/types';

	let {
		files,
		activeIndex,
		onselect
	}: {
		files: LessonFile[];
		activeIndex: number;
		onselect: (index: number) => void;
	} = $props();
</script>

<div class="tab-bar">
	{#each files as file, i}
		<button
			class="tab"
			class:active={i === activeIndex}
			onclick={() => onselect(i)}
			title={file.filename}
		>
			<span class="tab-icon">
				{#if file.language === 'svelte'}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<path d="M20.4 6.2c-1.8-2.7-5.4-3.5-8.1-1.8L7.6 7.6C6.3 8.4 5.4 9.7 5.2 11.2c-.2 1.1 0 2.2.5 3.2-.3.5-.5 1-.7 1.6-.3 1.5-.1 3.1.6 4.4 1.8 2.7 5.4 3.5 8.1 1.8l4.7-3.2c1.3-.8 2.2-2.1 2.4-3.6.2-1.1 0-2.2-.5-3.2.3-.5.5-1 .7-1.6.3-1.5.1-3.1-.6-4.4z" fill="#FF3E00"/>
					</svg>
				{:else if file.language === 'typescript' || file.language === 'javascript'}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect width="24" height="24" rx="3" fill="#3178C6"/>
						<text x="6" y="17" fill="white" font-size="12" font-weight="bold">TS</text>
					</svg>
				{:else}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect width="24" height="24" rx="3" fill="#555"/>
						<text x="5" y="17" fill="white" font-size="10">&lt;/&gt;</text>
					</svg>
				{/if}
			</span>
			<span class="tab-name">{file.filename}</span>
		</button>
	{/each}
</div>

<style>
	.tab-bar {
		display: flex;
		align-items: stretch;
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		height: 36px;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab-bar::-webkit-scrollbar {
		display: none;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 0 var(--space-md);
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--text-secondary);
		background-color: var(--bg-secondary);
		border-right: 1px solid var(--border);
		white-space: nowrap;
		transition: color var(--transition-fast), background-color var(--transition-fast);
		cursor: pointer;
		min-width: 0;
	}

	.tab:hover {
		color: var(--text-primary);
		background-color: var(--bg-tertiary);
	}

	.tab.active {
		color: var(--text-bright);
		background-color: var(--bg-primary);
		border-bottom: 2px solid var(--accent);
	}

	.tab-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.tab-name {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
