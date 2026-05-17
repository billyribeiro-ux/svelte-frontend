<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong.');

	const friendly: Record<number, { title: string; icon: string }> = {
		404: { title: 'Page not found',     icon: 'ph:map-trifold' },
		403: { title: 'Access denied',      icon: 'ph:lock-simple' },
		500: { title: 'Server error',       icon: 'ph:warning-octagon' }
	};
	const info = $derived(friendly[status] ?? { title: 'Unexpected error', icon: 'ph:bug' });
</script>

<div class="inner-error" in:fly={{ y: 24, duration: 600, easing: expoOut, opacity: 0 }}>
	<div class="inner-error-icon">
		<Icon icon={info.icon} size={32} />
	</div>
	<span class="inner-error-code">{status}</span>
	<h1 class="inner-error-title">{info.title}</h1>
	<p class="inner-error-msg">{message}</p>
	<div class="inner-error-actions">
		<a href="/dashboard">
			<Button variant="primary" size="sm">Go to Dashboard</Button>
		</a>
		<a href="/learn">
			<Button variant="ghost" size="sm">Browse Tracks</Button>
		</a>
	</div>
</div>

<style>
	.inner-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sf-space-4);
		padding-block: var(--sf-space-8);
		text-align: center;
		max-inline-size: 420px;
		margin-inline: auto;
	}

	.inner-error-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 64px;
		block-size: 64px;
		border-radius: var(--sf-radius-lg);
		background: oklch(0.65 0.22 25 / 0.08);
		color: oklch(0.72 0.18 25);
		border: 1px solid oklch(0.65 0.22 25 / 0.18);
	}

	.inner-error-code {
		font-family: var(--sf-font-mono);
		font-size: 3rem;
		font-weight: 800;
		color: var(--sf-text-0);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.inner-error-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.inner-error-msg {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.65;
	}

	.inner-error-actions {
		display: flex;
		gap: var(--sf-space-3);
		flex-wrap: wrap;
		justify-content: center;

		a { text-decoration: none; }
	}
</style>
