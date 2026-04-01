<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		value: number;
		size?: 'sm' | 'md';
		showLabel?: boolean;
		class?: string;
	}

	let { value, size = 'md', showLabel = false, class: className }: Props = $props();

	const clamped = $derived(Math.min(100, Math.max(0, value)));
</script>

<div class={cn('sf-progress', `sf-progress--${size}`, className)} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={`${clamped}% complete`}>
	<div class="sf-progress-track">
		<div class="sf-progress-fill" style:inline-size="{clamped}%"></div>
	</div>
	{#if showLabel}
		<span class="sf-progress-label">{Math.round(clamped)}%</span>
	{/if}
</div>

<style>
	.sf-progress {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		inline-size: 100%;
	}

	.sf-progress-track {
		flex: 1;
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-full);
		overflow: hidden;
	}

	.sf-progress--sm .sf-progress-track {
		block-size: 4px;
	}

	.sf-progress--md .sf-progress-track {
		block-size: 8px;
	}

	.sf-progress-fill {
		block-size: 100%;
		background: var(--sf-accent);
		border-radius: var(--sf-radius-full);
		transition: inline-size var(--sf-transition-slow);
	}

	.sf-progress-label {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		color: var(--sf-text-1);
		min-inline-size: 3ch;
		text-align: end;
	}
</style>
