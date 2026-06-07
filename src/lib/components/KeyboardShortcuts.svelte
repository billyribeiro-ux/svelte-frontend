<script lang="ts">
	let visible = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

		if (e.key === '?' && !isInput) {
			e.preventDefault();
			visible = !visible;
			return;
		}

		if (e.key === 'Escape' && visible) {
			visible = false;
		}
	}

	function handleBackdropClick() {
		visible = false;
	}

	const shortcuts = [
		{ keys: 'Ctrl+K / Cmd+K', description: 'Focus search' },
		{ keys: 'Alt+←', description: 'Previous lesson' },
		{ keys: 'Alt+→', description: 'Next lesson' },
		{ keys: 'Ctrl+Enter', description: 'Mark lesson complete' },
		{ keys: '?', description: 'Show/hide shortcuts panel' },
		{ keys: 'Escape', description: 'Close panel / clear search' }
	];
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" tabindex="-1" onkeydown={(e) => { if (e.key === 'Escape') visible = false; }}>
			<div class="modal-header">
				<h2 class="modal-title">Keyboard Shortcuts</h2>
				<button class="close-btn" onclick={() => (visible = false)} aria-label="Close">
					&#x2715;
				</button>
			</div>
			<div class="shortcuts-list">
				{#each shortcuts as shortcut (shortcut.keys)}
					<div class="shortcut-row">
						<div class="shortcut-keys">
							{#each shortcut.keys.split(' / ') as combo, i}
								{#if i > 0}
									<span class="key-separator">/</span>
								{/if}
								<kbd class="key">{combo}</kbd>
							{/each}
						</div>
						<span class="shortcut-desc">{shortcut.description}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		width: 420px;
		max-width: 90vw;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg) var(--space-lg) var(--space-md);
		border-bottom: 1px solid var(--border);
	}

	.modal-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-bright);
	}

	.close-btn {
		font-size: 16px;
		color: var(--text-muted);
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.close-btn:hover {
		color: var(--text-primary);
		background: var(--bg-hover);
	}

	.shortcuts-list {
		padding: var(--space-md) var(--space-lg) var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-xs) 0;
	}

	.shortcut-keys {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-shrink: 0;
	}

	.key {
		display: inline-block;
		padding: 2px 8px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-bright);
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}

	.key-separator {
		font-size: 12px;
		color: var(--text-muted);
	}

	.shortcut-desc {
		font-size: 13px;
		color: var(--text-secondary);
		text-align: right;
	}
</style>
