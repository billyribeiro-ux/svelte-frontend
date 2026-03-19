<script lang="ts">
	let {
		url,
		isBooting
	}: {
		url: string | null;
		isBooting: boolean;
	} = $props();
</script>

<div class="preview-container">
	{#if isBooting}
		<div class="preview-placeholder">
			<div class="spinner"></div>
			<p class="status-text">Starting development server...</p>
			<p class="status-sub">Installing dependencies and booting WebContainer</p>
		</div>
	{:else if url}
		<iframe
			src={url}
			title="Preview"
			allow="cross-origin-isolated"
			class="preview-iframe"
		></iframe>
	{:else}
		<div class="preview-placeholder">
			<div class="ready-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<p class="status-text">Ready to code!</p>
			<p class="status-sub">Edit a file to start the dev server and see your changes here</p>
		</div>
	{/if}
</div>

<style>
	.preview-container {
		width: 100%;
		height: 100%;
		background-color: var(--bg-primary);
		display: flex;
		flex-direction: column;
	}

	.preview-iframe {
		width: 100%;
		height: 100%;
		border: none;
		background-color: #ffffff;
	}

	.preview-placeholder {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		color: var(--text-secondary);
	}

	.status-text {
		font-size: 16px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.status-sub {
		font-size: 13px;
		color: var(--text-muted);
		text-align: center;
		max-width: 280px;
	}

	.ready-icon {
		color: var(--accent);
		margin-bottom: var(--space-sm);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--bg-hover);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: var(--space-sm);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
