<script lang="ts">
	import type { CompilationResult, DOMMutation } from '$types/editor';
	import CompilerOutput from './CompilerOutput.svelte';
	import ReactivityGraph from './ReactivityGraph.svelte';
	import DOMInspector from './DOMInspector.svelte';
	import StateInspector from './StateInspector.svelte';

	interface Props {
		compilationResult: CompilationResult | null;
		sourceCode: string;
		domMutations: DOMMutation[];
	}

	let { compilationResult, sourceCode, domMutations }: Props = $props();

	let activeTab = $state<'compiler' | 'reactivity' | 'dom' | 'state'>('compiler');
</script>

<div class="xray-panel">
	<div class="xray-tabs">
		<button class="xray-tab" class:active={activeTab === 'compiler'} onclick={() => activeTab = 'compiler'}>
			Compiler Output
		</button>
		<button class="xray-tab" class:active={activeTab === 'reactivity'} onclick={() => activeTab = 'reactivity'}>
			Reactivity Graph
		</button>
		<button class="xray-tab" class:active={activeTab === 'dom'} onclick={() => activeTab = 'dom'}>
			DOM Inspector
			{#if domMutations.length > 0}
				<span class="mutation-count">{domMutations.length}</span>
			{/if}
		</button>
		<button class="xray-tab" class:active={activeTab === 'state'} onclick={() => activeTab = 'state'}>
			State Inspector
		</button>
	</div>

	<div class="xray-content">
		{#if activeTab === 'compiler'}
			<CompilerOutput {compilationResult} {sourceCode} />
		{:else if activeTab === 'reactivity'}
			<ReactivityGraph {compilationResult} />
		{:else if activeTab === 'dom'}
			<DOMInspector mutations={domMutations} />
		{:else if activeTab === 'state'}
			<StateInspector {sourceCode} {compilationResult} />
		{/if}
	</div>
</div>

<style>
	.xray-panel {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.xray-tabs {
		display: flex;
		gap: var(--sf-space-1);
		padding: var(--sf-space-1) var(--sf-space-2);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.xray-tab {
		display: flex;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-1) var(--sf-space-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);
		transition: all var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-1);
			background: var(--sf-bg-3);
		}

		&.active {
			color: var(--sf-accent);
			background: var(--sf-accent-subtle);
		}
	}

	.mutation-count {
		font-size: 10px;
		background: var(--sf-warning);
		color: var(--sf-bg-0);
		padding: 0 5px;
		border-radius: var(--sf-radius-full);
		line-height: 1.6;
		font-weight: 600;
	}

	.xray-content {
		flex: 1;
		overflow: auto;
	}
</style>
