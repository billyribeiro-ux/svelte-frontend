<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	const shortcuts = [
		{ keys: ['Ctrl', '1'], description: 'Toggle lesson panel' },
		{ keys: ['Ctrl', '2'], description: 'Focus editor' },
		{ keys: ['Ctrl', '3'], description: 'Toggle preview panel' },
		{ keys: ['Ctrl', 'J'], description: 'Toggle bottom panel' },
		{ keys: ['Ctrl', 'K'], description: 'Command palette' },
		{ keys: ['Ctrl', 'T'], description: 'Toggle AI tutor' },
		{ keys: ['Ctrl', 'Enter'], description: 'Run code' },
		{ keys: ['Ctrl', '?'], description: 'Show this dialog' }
	];

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="backdrop"
		role="presentation"
		onclick={onclose}
		onkeydown={handleKeydown}
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="dialog"
			role="dialog"
			aria-label="Keyboard shortcuts"
			aria-modal="true"
			tabindex="0"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleKeydown}
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			<header class="dialog-header">
				<h2>Keyboard Shortcuts</h2>
				<button class="close-btn" onclick={onclose} aria-label="Close">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</button>
			</header>
			<ul class="shortcut-list">
				{#each shortcuts as shortcut}
					<li class="shortcut-item">
						<span class="shortcut-desc">{shortcut.description}</span>
						<span class="shortcut-keys">
							{#each shortcut.keys as key, i}
								<kbd>{key}</kbd>
								{#if i < shortcut.keys.length - 1}
									<span class="separator">+</span>
								{/if}
							{/each}
						</span>
					</li>
				{/each}
			</ul>
			<footer class="dialog-footer">
				<p>On macOS, use <kbd>Cmd</kbd> instead of <kbd>Ctrl</kbd></p>
			</footer>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0 0 0 / 0.6);
		backdrop-filter: blur(4px);
	}

	.dialog {
		inline-size: min(420px, 90vw);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		box-shadow: var(--sf-shadow-lg);
		overflow: hidden;
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-4) var(--sf-space-5);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.dialog-header h2 {
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);

		&:hover {
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
		}
	}

	.shortcut-list {
		list-style: none;
		margin: 0;
		padding: var(--sf-space-3) var(--sf-space-5);
	}

	.shortcut-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-2) 0;
		border-block-end: 1px solid var(--sf-bg-2);

		&:last-child {
			border-block-end: none;
		}
	}

	.shortcut-desc {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
	}

	.shortcut-keys {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 6px;
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		background: var(--sf-bg-3);
		color: var(--sf-text-1);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-sm);
		box-shadow: 0 1px 0 var(--sf-bg-4);
	}

	.separator {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.dialog-footer {
		padding: var(--sf-space-3) var(--sf-space-5);
		border-block-start: 1px solid var(--sf-bg-3);
		text-align: center;
	}

	.dialog-footer p {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		margin: 0;
	}

	.dialog-footer kbd {
		font-size: 10px;
		height: 18px;
		min-width: 18px;
		padding: 0 4px;
	}
</style>
