<script lang="ts">
	import type { CompilationResult } from '$types/editor';

	interface Props {
		sourceCode: string;
		compilationResult: CompilationResult | null;
	}

	let { sourceCode, compilationResult }: Props = $props();

	interface StateDeclaration {
		name: string;
		initialValue: string;
		rune: string;
		line: number;
	}

	let declarations = $derived.by(() => {
		const result: StateDeclaration[] = [];
		const lines = sourceCode.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]!;

			// Match: let name = $state(...)
			const stateMatch = line.match(/let\s+(\w+)\s*=\s*\$state(?:\.raw)?\s*[<(]/);
			if (stateMatch?.[1]) {
				const initMatch = line.match(/\$state(?:\.raw)?\s*(?:<[^>]*>)?\((.+?)\)\s*;?\s*$/);
				result.push({
					name: stateMatch[1],
					initialValue: initMatch?.[1]?.trim() ?? '(complex)',
					rune: line.includes('$state.raw') ? '$state.raw' : '$state',
					line: i + 1
				});
			}

			// Match: let name = $derived(...)
			const derivedMatch = line.match(/let\s+(\w+)\s*=\s*\$derived(?:\.by)?\s*[(<]/);
			if (derivedMatch?.[1]) {
				const exprMatch = line.match(/\$derived\((.+?)\)\s*;?\s*$/);
				result.push({
					name: derivedMatch[1],
					initialValue: exprMatch?.[1]?.trim() ?? '(computed)',
					rune: line.includes('$derived.by') ? '$derived.by' : '$derived',
					line: i + 1
				});
			}
		}

		return result;
	});

	let runesUsed = $derived(compilationResult?.metadata.runes ?? []);
	let bindings = $derived(compilationResult?.metadata.bindings ?? []);
</script>

<div class="state-inspector">
	<div class="section">
		<div class="section-title">Reactive Declarations</div>
		{#if declarations.length === 0}
			<div class="empty">No reactive declarations found. Use <code>$state</code> or <code>$derived</code> to create reactive values.</div>
		{:else}
			<div class="decl-list">
				{#each declarations as decl}
					<div class="decl-item">
						<span class="decl-rune">{decl.rune}</span>
						<span class="decl-name">{decl.name}</span>
						<span class="decl-equals">=</span>
						<span class="decl-value">{decl.initialValue}</span>
						<span class="decl-line">L{decl.line}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if bindings.length > 0}
		<div class="section">
			<div class="section-title">Bindings</div>
			<div class="binding-list">
				{#each bindings as binding}
					<span class="binding-badge">bind:{binding}</span>
				{/each}
			</div>
		</div>
	{/if}

	{#if runesUsed.length > 0}
		<div class="section">
			<div class="section-title">Runes Summary</div>
			<div class="rune-list">
				{#each runesUsed as rune}
					<div class="rune-item">
						<span class="rune-name">{rune}</span>
						<span class="rune-desc">{getRuneDescription(rune)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<script lang="ts" module>
	function getRuneDescription(rune: string): string {
		const descriptions: Record<string, string> = {
			'$state': 'Reactive state — triggers UI updates on change',
			'$state.raw': 'Non-proxied reactive state — for large objects',
			'$derived': 'Computed value — recalculates when dependencies change',
			'$derived.by': 'Computed value with complex logic',
			'$effect': 'Side effect — runs after render when dependencies change',
			'$effect.pre': 'Runs before DOM updates',
			'$effect.root': 'Manual lifecycle control',
			'$props': 'Component props declaration',
			'$bindable': 'Two-way bindable prop',
			'$inspect': 'Development-only debugging'
		};
		return descriptions[rune] ?? 'Svelte 5 rune';
	}
</script>

<style>
	.state-inspector {
		padding: var(--sf-space-3);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
	}

	.section-title {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--sf-space-2);
	}

	.empty {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);

		:global(code) {
			font-family: var(--sf-font-mono);
			background: var(--sf-bg-3);
			padding: 0.1em 0.3em;
			border-radius: var(--sf-radius-sm);
			color: var(--sf-syntax-rune);
		}
	}

	.decl-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.decl-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-2) var(--sf-space-3);
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-sm);
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
	}

	.decl-rune {
		color: var(--sf-syntax-rune);
		font-weight: 600;
		flex-shrink: 0;
	}

	.decl-name {
		color: var(--sf-syntax-variable);
		font-weight: 500;
	}

	.decl-equals { color: var(--sf-text-3); }
	.decl-value { color: var(--sf-syntax-string); flex: 1; }
	.decl-line { color: var(--sf-text-3); margin-inline-start: auto; }

	.binding-list {
		display: flex;
		gap: var(--sf-space-2);
		flex-wrap: wrap;
	}

	.binding-badge {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		padding: 2px 8px;
		background: var(--sf-bg-3);
		color: var(--sf-syntax-attribute);
		border-radius: var(--sf-radius-sm);
	}

	.rune-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.rune-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		padding: var(--sf-space-1) var(--sf-space-3);
	}

	.rune-name {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-syntax-rune);
		font-weight: 600;
		inline-size: 8em;
		flex-shrink: 0;
	}

	.rune-desc {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}
</style>
