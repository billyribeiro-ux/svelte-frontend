<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		value?: string;
		label?: string;
		placeholder?: string;
		type?: 'text' | 'email' | 'password' | 'search';
		error?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		label,
		placeholder,
		type = 'text',
		error,
		disabled = false,
		class: className
	}: Props = $props();

	const inputId = $derived(`sf-input-${Math.random().toString(36).slice(2, 9)}`);
	const errorId = $derived(error ? `${inputId}-error` : undefined);
</script>

<div class={cn('sf-input-wrapper', error && 'sf-input-wrapper--error', className)}>
	{#if label}
		<label class="sf-input-label" for={inputId}>{label}</label>
	{/if}
	<input
		id={inputId}
		class="sf-input"
		{type}
		{placeholder}
		{disabled}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={errorId}
	/>
	{#if error}
		<p class="sf-input-error" id={errorId} role="alert">{error}</p>
	{/if}
</div>

<style>
	.sf-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.sf-input-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
	}

	.sf-input {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-0);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);
		outline: none;
		inline-size: 100%;

		&::placeholder {
			color: var(--sf-text-3);
		}

		&:focus {
			border-color: var(--sf-accent);
			box-shadow: 0 0 0 2px var(--sf-accent-subtle);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.sf-input-wrapper--error {
		& .sf-input {
			border-color: var(--sf-error);

			&:focus {
				box-shadow: 0 0 0 2px oklch(0.65 0.22 25 / 0.25);
			}
		}
	}

	.sf-input-error {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-error);
		margin: 0;
	}
</style>
