<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label,
		disabled = false,
		class: className
	}: Props = $props();

	const switchId = `sf-switch-${Math.random().toString(36).slice(2, 9)}`;

	function toggle() {
		if (!disabled) checked = !checked;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div class={cn('sf-switch-wrapper', className)}>
	<button
		id={switchId}
		class="sf-switch"
		class:sf-switch--checked={checked}
		role="switch"
		type="button"
		aria-checked={checked}
		aria-label={label ?? undefined}
		{disabled}
		onclick={toggle}
		onkeydown={handleKeydown}
	>
		<span class="sf-switch-thumb"></span>
	</button>
	{#if label}
		<label class="sf-switch-label" for={switchId}>{label}</label>
	{/if}
</div>

<style>
	.sf-switch-wrapper {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
	}

	.sf-switch {
		position: relative;
		inline-size: 40px;
		block-size: 22px;
		border-radius: var(--sf-radius-full);
		background: var(--sf-bg-3);
		border: 1px solid var(--sf-bg-4);
		padding: 2px;
		cursor: pointer;
		transition: background var(--sf-transition-fast), border-color var(--sf-transition-fast);

		&:focus-visible {
			outline: 2px solid var(--sf-accent);
			outline-offset: 2px;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&.sf-switch--checked {
			background: var(--sf-accent);
			border-color: var(--sf-accent);
		}
	}

	.sf-switch-thumb {
		display: block;
		inline-size: 16px;
		block-size: 16px;
		border-radius: var(--sf-radius-full);
		background: var(--sf-text-0);
		transition: translate var(--sf-transition-fast);

		.sf-switch--checked & {
			translate: 18px 0;
		}
	}

	.sf-switch-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		cursor: pointer;
		user-select: none;
	}
</style>
