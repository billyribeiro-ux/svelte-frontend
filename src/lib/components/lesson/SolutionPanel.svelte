<script lang="ts">
	import type { LessonFile } from '$lib/types';

	let {
		starterFiles,
		solutionFiles,
		visible,
		onclose
	}: {
		starterFiles: LessonFile[];
		solutionFiles: LessonFile[];
		visible: boolean;
		onclose: () => void;
	} = $props();

	let activeFileIndex = $state(0);
	let copied = $state(false);

	const activeStarter = $derived(starterFiles[activeFileIndex]);
	const activeSolution = $derived(solutionFiles[activeFileIndex]);

	function selectFile(index: number) {
		activeFileIndex = index;
		copied = false;
	}

	function copyToClipboard() {
		if (!activeSolution) return;
		navigator.clipboard.writeText(activeSolution.content).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}

	function getLines(content: string): string[] {
		return content.split('\n');
	}

	function buildLineMap(starterLines: string[], solutionLines: string[]): {
		starter: { line: string; status: 'same' | 'removed' | 'context' }[];
		solution: { line: string; status: 'same' | 'added' | 'context' }[];
	} {
		const starterSet = new Set(starterLines.map((l) => l.trimEnd()));
		const solutionSet = new Set(solutionLines.map((l) => l.trimEnd()));

		const starter = starterLines.map((line) => ({
			line,
			status: solutionSet.has(line.trimEnd()) ? ('same' as const) : ('removed' as const)
		}));

		const solution = solutionLines.map((line) => ({
			line,
			status: starterSet.has(line.trimEnd()) ? ('same' as const) : ('added' as const)
		}));

		return { starter, solution };
	}

	const diffData = $derived.by(() => {
		if (!activeStarter || !activeSolution) return null;
		const starterLines = getLines(activeStarter.content);
		const solutionLines = getLines(activeSolution.content);
		return buildLineMap(starterLines, solutionLines);
	});
</script>

{#if visible}
	<div class="solution-overlay" role="dialog" aria-label="Solution">
		<div class="solution-panel">
			<div class="panel-header">
				<h2>Solution</h2>
				<div class="header-actions">
					<button class="copy-btn" onclick={copyToClipboard}>
						{copied ? 'Copied!' : 'Copy Solution'}
					</button>
					<button class="close-btn" onclick={onclose} aria-label="Close">
						&times;
					</button>
				</div>
			</div>

			<div class="file-tabs">
				{#each solutionFiles as file, i}
					<button
						class={['file-tab', i === activeFileIndex && 'active']}
						onclick={() => selectFile(i)}
					>
						{file.filename}
					</button>
				{/each}
			</div>

			<div class="diff-container">
				{#if diffData}
					<div class="diff-pane">
						<div class="diff-label">Starter</div>
						<pre class="diff-code">{#each diffData.starter as { line, status }, i}<span class="diff-line {status}"><span class="line-num">{i + 1}</span>{line}
</span>{/each}</pre>
					</div>
					<div class="diff-pane">
						<div class="diff-label">Solution</div>
						<pre class="diff-code">{#each diffData.solution as { line, status }, i}<span class="diff-line {status}"><span class="line-num">{i + 1}</span>{line}
</span>{/each}</pre>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.solution-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
	}

	.solution-panel {
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 1200px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--border);
		background: var(--bg-secondary);
	}

	.panel-header h2 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: var(--text-bright);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.copy-btn {
		padding: 4px 12px;
		font-size: 12px;
		font-weight: 600;
		border-radius: var(--radius-sm);
		background: var(--accent);
		color: white;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.copy-btn:hover {
		background: var(--accent-hover);
	}

	.close-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.file-tabs {
		display: flex;
		align-items: stretch;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.file-tabs::-webkit-scrollbar {
		display: none;
	}

	.file-tab {
		padding: 6px 14px;
		font-size: 12px;
		color: var(--text-secondary);
		background: transparent;
		border: none;
		border-right: 1px solid var(--border);
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--transition-fast);
	}

	.file-tab:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.file-tab.active {
		color: var(--text-bright);
		background: var(--bg-primary);
		border-bottom: 2px solid var(--accent);
	}

	.diff-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.diff-pane {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	.diff-pane:first-child {
		border-right: 1px solid var(--border);
	}

	.diff-label {
		padding: 4px 12px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}

	.diff-code {
		margin: 0;
		padding: 0;
		overflow: auto;
		flex: 1;
		font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
		font-size: 12px;
		line-height: 1.6;
		tab-size: 2;
	}

	.diff-line {
		display: block;
		padding: 0 8px;
		white-space: pre;
	}

	.line-num {
		display: inline-block;
		width: 3.5em;
		text-align: right;
		padding-right: 8px;
		margin-right: 8px;
		color: var(--text-secondary);
		opacity: 0.5;
		user-select: none;
		border-right: 1px solid var(--border);
	}

	.diff-line.same {
		color: var(--text-primary);
	}

	.diff-line.added {
		background: #e6ffec;
		color: #1a3a1a;
	}

	.diff-line.removed {
		background: #ffeef0;
		color: #5c1a1a;
	}

	@media (prefers-color-scheme: dark) {
		.diff-line.added {
			background: rgba(46, 160, 67, 0.15);
			color: #7ee787;
		}

		.diff-line.removed {
			background: rgba(248, 81, 73, 0.15);
			color: #ffa198;
		}
	}
</style>
