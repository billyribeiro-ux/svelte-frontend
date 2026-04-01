<script lang="ts">
	import { cn } from '$utils/cn';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value?: string;
		options: Option[];
		label?: string;
		placeholder?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		options,
		label,
		placeholder = 'Select an option',
		class: className
	}: Props = $props();

	const selectId = `sf-select-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class={cn('sf-select-wrapper', className)}>
	{#if label}
		<label class="sf-select-label" for={selectId}>{label}</label>
	{/if}
	<div class="sf-select-container">
		<select id={selectId} class="sf-select" bind:value aria-label={label ?? placeholder}>
			{#if placeholder}
				<option value="" disabled>{placeholder}</option>
			{/if}
			{#each options as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<span class="sf-select-chevron" aria-hidden="true">&#x25BE;</span>
	</div>
</div>

<style>
	.sf-select-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.sf-select-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
	}

	.sf-select-container {
		position: relative;
		display: flex;
	}

	.sf-select {
		appearance: none;
		inline-size: 100%;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-0);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		padding-block: var(--sf-space-2);
		padding-inline-start: var(--sf-space-3);
		padding-inline-end: var(--sf-space-6);
		cursor: pointer;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);
		outline: none;

		&:focus {
			border-color: var(--sf-accent);
			box-shadow: 0 0 0 2px var(--sf-accent-subtle);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.sf-select-chevron {
		position: absolute;
		inset-inline-end: var(--sf-space-3);
		inset-block-start: 50%;
		translate: 0 -50%;
		color: var(--sf-text-2);
		font-size: var(--sf-font-size-sm);
		pointer-events: none;
	}
</style>
