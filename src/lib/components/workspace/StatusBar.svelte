<script lang="ts">
	import { lessonState } from '$stores/lesson.svelte';
	import { editor } from '$stores/editor.svelte';
	import { workspace } from '$stores/workspace.svelte';
	import { userState } from '$stores/user.svelte';
	import { formatPercentage } from '$utils/format';

	interface Props {
		onsettings?: () => void;
	}

	let { onsettings }: Props = $props();

	let language = $derived(editor.activeFile?.language ?? 'svelte');
	let progress = $derived(lessonState.progress);
	let conceptCount = $derived(lessonState.current?.concepts.length ?? 0);
	let isDark = $derived(userState.preferences.theme === 'dark');

	let isMac = $state(false);

	$effect(() => {
		isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
	});

	let shortcutKey = $derived(isMac ? 'Cmd' : 'Ctrl');

	function toggleTheme() {
		userState.setTheme(isDark ? 'light' : 'dark');
	}
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
		<button class="status-btn" onclick={toggleTheme} aria-label="Toggle theme ({isDark ? 'switch to light' : 'switch to dark'})">
			{#if isDark}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
					<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{/if}
		</button>
		<button class="status-btn" onclick={onsettings} aria-label="Open settings">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.5"/>
				<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
			</svg>
		</button>
		<span class="status-item shortcut">{shortcutKey}+K: Commands</span>
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

	.status-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);
		transition: color var(--sf-transition-fast), background var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
		}
	}
</style>
