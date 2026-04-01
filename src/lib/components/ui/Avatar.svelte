<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		src?: string | null;
		alt: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { src = null, alt, size = 'md', class: className }: Props = $props();

	let imgFailed = $state(false);

	const initials = $derived(
		alt
			.split(' ')
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('')
	);

	const showImage = $derived(src && !imgFailed);
</script>

<span
	class={cn('sf-avatar', `sf-avatar--${size}`, className)}
	role="img"
	aria-label={alt}
>
	{#if showImage}
		<img
			class="sf-avatar-img"
			src={src}
			alt={alt}
			onerror={() => (imgFailed = true)}
		/>
	{:else}
		<span class="sf-avatar-initials" aria-hidden="true">{initials}</span>
	{/if}
</span>

<style>
	.sf-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--sf-radius-full);
		background: var(--sf-accent-subtle);
		overflow: hidden;
		flex-shrink: 0;

		&.sf-avatar--sm {
			inline-size: 28px;
			block-size: 28px;
		}

		&.sf-avatar--md {
			inline-size: 36px;
			block-size: 36px;
		}

		&.sf-avatar--lg {
			inline-size: 48px;
			block-size: 48px;
		}
	}

	.sf-avatar-img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.sf-avatar-initials {
		font-family: var(--sf-font-sans);
		font-weight: 600;
		color: var(--sf-accent);
		user-select: none;

		.sf-avatar--sm & {
			font-size: var(--sf-font-size-xs);
		}

		.sf-avatar--md & {
			font-size: var(--sf-font-size-sm);
		}

		.sf-avatar--lg & {
			font-size: var(--sf-font-size-base);
		}
	}
</style>
