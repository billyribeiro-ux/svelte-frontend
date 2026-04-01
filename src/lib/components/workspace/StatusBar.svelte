<script lang="ts">
	import { lessonState } from '$stores/lesson.svelte';
	import { editor } from '$stores/editor.svelte';
	import { workspace } from '$stores/workspace.svelte';
	import { formatPercentage } from '$utils/format';

	let language = $derived(editor.activeFile?.language ?? 'svelte');
	let progress = $derived(lessonState.progress);
	let conceptCount = $derived(lessonState.current?.concepts.length ?? 0);
</script>

<footer class="status-bar">
	<div class="status-left">
		<span class="status-item language">{language}</span>
		{#if conceptCount > 0}
			<span class="status-item">{conceptCount} concepts</span>
		{/if}
	</div>

	<div class="status-center">
		{#if lessonState.current}
			<span class="status-item">
				Progress: {formatPercentage(progress)}
			</span>
		{/if}
	</div>

	<div class="status-right">
		{#if workspace.xrayEnabled}
			<span class="status-item xray">X-Ray</span>
		{/if}
		<span class="status-item shortcut">Cmd+K: Commands</span>
	</div>
</footer>

<style>
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		block-size: 28px;
		padding-inline: var(--sf-space-3);
		background: var(--sf-bg-1);
		border-block-start: 1px solid var(--sf-bg-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		flex-shrink: 0;
	}

	.status-left,
	.status-center,
	.status-right {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-1);
	}

	.language {
		text-transform: uppercase;
		font-weight: 500;
		color: var(--sf-accent);
	}

	.xray {
		color: var(--sf-warning);
		font-weight: 600;
	}

	.shortcut {
		opacity: 0.6;
	}
</style>
