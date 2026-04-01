<script lang="ts">
	import type { CompilationResult } from '$types/editor';

	interface Props {
		compilationResult: CompilationResult | null;
		sourceCode: string;
	}

	let { compilationResult, sourceCode }: Props = $props();

	let compiledJS = $derived(compilationResult?.js ?? '// No compiled output yet');
	let compiledCSS = $derived(compilationResult?.css ?? '');
	let showCSS = $state(false);

	let runesUsed = $derived(compilationResult?.metadata.runes ?? []);
	let warnings = $derived(compilationResult?.warnings ?? []);
</script>

<div class="compiler-output">
	<div class="output-header">
		<div class="runes-info">
			{#if runesUsed.length > 0}
				<span class="runes-label">Runes detected:</span>
				{#each runesUsed as rune}
					<span class="rune-badge">{rune}</span>
				{/each}
			{:else}
				<span class="runes-label">No runes detected</span>
			{/if}
		</div>
		<div class="output-actions">
			<button class="toggle-btn" class:active={showCSS} onclick={() => showCSS = !showCSS}>
				{showCSS ? 'Show JS' : 'Show CSS'}
			</button>
		</div>
	</div>

	{#if warnings.length > 0}
		<div class="warnings">
			{#each warnings as warning}
				<div class="warning-item">
					<span class="warning-icon">&#9888;</span>
					<span class="warning-text">{warning.message}</span>
					{#if warning.start}
						<span class="warning-loc">Line {warning.start.line}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<div class="code-split">
		<div class="code-pane">
			<div class="pane-header">Source</div>
			<pre class="code-block"><code>{sourceCode}</code></pre>
		</div>
		<div class="code-pane">
			<div class="pane-header">{showCSS ? 'Compiled CSS' : 'Compiled JS'}</div>
			<pre class="code-block"><code>{showCSS ? (compiledCSS || '/* No CSS output */') : compiledJS}</code></pre>
		</div>
	</div>
</div>

<style>
	.compiler-output {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.output-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-2) var(--sf-space-3);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.runes-info {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		flex-wrap: wrap;
	}

	.runes-label {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.rune-badge {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		padding: 1px 6px;
		background: oklch(0.78 0.22 330 / 0.15);
		color: var(--sf-syntax-rune);
		border-radius: var(--sf-radius-sm);
	}

	.toggle-btn {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		padding: var(--sf-space-1) var(--sf-space-2);
		border-radius: var(--sf-radius-sm);

		&:hover, &.active {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
		}
	}

	.warnings {
		padding: var(--sf-space-2) var(--sf-space-3);
		background: oklch(0.78 0.18 75 / 0.08);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.warning-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-warning);
	}

	.warning-icon { font-size: var(--sf-font-size-sm); }
	.warning-text { flex: 1; }
	.warning-loc { color: var(--sf-text-3); }

	.code-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex: 1;
		min-block-size: 0;
		overflow: hidden;
	}

	.code-pane {
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&:first-child {
			border-inline-end: 1px solid var(--sf-bg-3);
		}
	}

	.pane-header {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-2);
		padding: var(--sf-space-1) var(--sf-space-3);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.code-block {
		flex: 1;
		margin: 0;
		padding: var(--sf-space-3);
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		line-height: 1.6;
		color: var(--sf-text-1);
		overflow: auto;
		white-space: pre;
		tab-size: 2;
	}
</style>
