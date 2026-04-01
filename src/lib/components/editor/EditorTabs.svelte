<script lang="ts">
	import type { EditorFile } from '$types/lesson';
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		files: EditorFile[];
		activeIndex: number;
		onselect: (index: number) => void;
		onclose?: (index: number) => void;
	}

	let { files, activeIndex, onselect, onclose }: Props = $props();

	const languageIcons: Record<string, string> = {
		svelte: 'ph:file-code-bold',
		typescript: 'ph:file-ts-bold',
		css: 'ph:file-css-bold',
		html: 'ph:file-html-bold',
		json: 'ph:file-bold'
	};

	function getIcon(language: string): string {
		return languageIcons[language] ?? 'ph:file-bold';
	}

	function handleClose(event: MouseEvent, index: number) {
		event.stopPropagation();
		onclose?.(index);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onselect(index);
		}
	}
</script>

<div class="tab-bar" role="tablist">
	{#each files as file, index}
		<div
			class="tab"
			class:active={index === activeIndex}
			role="tab"
			aria-selected={index === activeIndex}
			tabindex={index === activeIndex ? 0 : -1}
			onclick={() => onselect(index)}
			onkeydown={(e) => handleKeydown(e, index)}
		>
			<Icon icon={getIcon(file.language)} size={14} />
			<span class="tab-name">{file.name}</span>
			{#if !file.readOnly && onclose}
				<button
					class="tab-close"
					aria-label="Close {file.name}"
					onclick={(e) => handleClose(e, index)}
				>
					<Icon icon="ph:x-bold" size={12} />
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.tab-bar {
		display: flex;
		align-items: stretch;
		gap: 0;
		background-color: var(--sf-editor-tabs-bg, var(--sf-surface-2, #1e1e1e));
		border-bottom: 1px solid var(--sf-border, #333);
		overflow-x: auto;
		scrollbar-width: none;
		min-height: 36px;
	}

	.tab-bar::-webkit-scrollbar {
		display: none;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: none;
		border-right: 1px solid var(--sf-border, #333);
		background: transparent;
		color: var(--sf-text-muted, #858585);
		font-size: var(--sf-font-size-sm, 13px);
		font-family: var(--sf-font-sans, system-ui, sans-serif);
		cursor: pointer;
		white-space: nowrap;
		transition: background-color 0.15s ease, color 0.15s ease;
		position: relative;
	}

	.tab:hover {
		background-color: var(--sf-surface-3, #2a2a2a);
		color: var(--sf-text, #d4d4d4);
	}

	.tab.active {
		background-color: var(--sf-editor-bg, #1e1e1e);
		color: var(--sf-text, #d4d4d4);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--sf-primary, #6d5ff5);
	}

	.tab-name {
		line-height: 1;
	}

	.tab-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		border: none;
		border-radius: var(--sf-radius-xs, 2px);
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s ease, background-color 0.15s ease;
	}

	.tab:hover .tab-close {
		opacity: 1;
	}

	.tab-close:hover {
		background-color: var(--sf-surface-4, #444);
	}
</style>
