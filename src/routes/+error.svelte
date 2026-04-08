<script lang="ts">
	import { page } from '$app/state';
	import { fly, blur } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong');

	const friendly: Record<number, { title: string; desc: string; icon: string }> = {
		404: { title: 'Page Not Found',         desc: 'The page you\'re looking for doesn\'t exist or has been moved.',                    icon: 'ph:map-trifold' },
		403: { title: 'Access Denied',           desc: 'You don\'t have permission to view this page.',                                     icon: 'ph:lock-simple' },
		500: { title: 'Server Error',            desc: 'Something went wrong on our end. We\'re working on it.',                           icon: 'ph:warning-octagon' },
		503: { title: 'Service Unavailable',     desc: 'SvelteForge is temporarily unavailable. Please try again in a moment.',            icon: 'ph:cloud-slash' }
	};

	const info = $derived(friendly[status] ?? { title: 'Unexpected Error', desc: message, icon: 'ph:bug' });
	let visible = $state(false);
	$effect(() => { visible = true; });
</script>

<svelte:head>
	<title>{status} — {info.title} | SvelteForge</title>
</svelte:head>

<div class="error-page">
	<div class="error-orb error-orb--a" aria-hidden="true"></div>
	<div class="error-orb error-orb--b" aria-hidden="true"></div>

	{#if visible}
		<div class="error-card" in:fly={{ y: 30, duration: 700, easing: expoOut, opacity: 0 }}>
			<div class="error-icon" in:blur={{ amount: 8, duration: 700, delay: 100, easing: expoOut }}>
				<Icon icon={info.icon} size={48} />
			</div>

			<div class="error-code" in:fly={{ y: 20, duration: 600, delay: 150, easing: expoOut, opacity: 0 }}>
				{status}
			</div>

			<h1 class="error-title" in:fly={{ y: 20, duration: 700, delay: 200, easing: expoOut, opacity: 0 }}>
				{info.title}
			</h1>

			<p class="error-desc" in:fly={{ y: 16, duration: 700, delay: 280, easing: expoOut, opacity: 0 }}>
				{info.desc}
			</p>

			<div class="error-actions" in:fly={{ y: 16, duration: 700, delay: 380, easing: expoOut, opacity: 0 }}>
				<a href="/">
					<Button variant="primary" size="md">
						<Icon icon="ph:house" size={16} />
						Go Home
					</Button>
				</a>
				{#if status === 404}
					<a href="/learn">
						<Button variant="ghost" size="md">Browse Tracks</Button>
					</a>
				{:else}
					<button onclick={() => window.location.reload()} class="reload-btn">
						<Icon icon="ph:arrow-clockwise" size={16} />
						Reload
					</button>
				{/if}
			</div>

			<p class="error-hint">
				Error {status} · <a href="mailto:support@svelteforge.dev">Contact Support</a>
			</p>
		</div>
	{/if}
</div>

<style>
	.error-page {
		position: relative;
		min-block-size: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--sf-bg-0);
		overflow: hidden;
		padding: var(--sf-space-5);
		-webkit-font-smoothing: antialiased;
	}

	.error-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
		pointer-events: none;
	}
	.error-orb--a {
		inline-size: 500px; block-size: 500px;
		background: radial-gradient(circle, oklch(0.65 0.22 25 / 0.08), transparent 65%);
		inset-block-start: 0; inset-inline-start: 0;
		translate: -30% -30%;
	}
	.error-orb--b {
		inline-size: 400px; block-size: 400px;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.08), transparent 65%);
		inset-block-end: 0; inset-inline-end: 0;
		translate: 30% 30%;
	}

	.error-card {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-4);
		text-align: center;
		max-inline-size: 480px;
	}

	.error-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 80px;
		block-size: 80px;
		border-radius: var(--sf-radius-xl);
		background: oklch(0.65 0.22 25 / 0.1);
		color: oklch(0.72 0.18 25);
		border: 1px solid oklch(0.65 0.22 25 / 0.2);
	}

	.error-code {
		font-family: var(--sf-font-mono);
		font-size: 5rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.04em;
		background: linear-gradient(135deg, var(--sf-text-0) 30%, oklch(0.65 0.22 25 / 0.8));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.error-title {
		font-family: var(--sf-font-sans);
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.error-desc {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.65;
		max-inline-size: 380px;
	}

	.error-actions {
		display: flex;
		gap: var(--sf-space-3);
		flex-wrap: wrap;
		justify-content: center;
		margin-block-start: var(--sf-space-2);
	}

	.error-actions a { text-decoration: none; }

	.reload-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-2) var(--sf-space-4);
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-md);
		color: var(--sf-text-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: border-color var(--sf-transition-fast), color var(--sf-transition-fast);
		&:hover { border-color: var(--sf-accent); color: var(--sf-accent); }
	}

	.error-hint {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		margin: var(--sf-space-2) 0 0;

		a { color: var(--sf-text-2); transition: color var(--sf-transition-fast); }
		a:hover { color: var(--sf-accent); }
	}
</style>
