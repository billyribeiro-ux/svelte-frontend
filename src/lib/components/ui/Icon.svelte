<script lang="ts">
	import IconifyIcon from '@iconify/svelte';
	import { cn } from '$utils/cn';

	interface Props {
		icon: string;
		size?: number;
		class?: string;
	}

	let { icon, size = 20, class: className }: Props = $props();

	const isAllowed = $derived(icon.startsWith('ph:') || icon.startsWith('carbon:'));
</script>

{#if isAllowed}
	<IconifyIcon {icon} width={size} height={size} class={cn('sf-icon', className)} aria-hidden="true" />
{:else}
	<span class={cn('sf-icon-error', className)} role="img" aria-label="Invalid icon prefix">
		⚠
	</span>
{/if}

<style>
	:global(.sf-icon) {
		display: inline-block;
		vertical-align: middle;
		flex-shrink: 0;
	}

	.sf-icon-error {
		display: inline-block;
		color: var(--sf-error);
		font-size: var(--sf-font-size-sm);
	}
</style>
