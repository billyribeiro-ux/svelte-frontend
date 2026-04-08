<script lang="ts">
	import Input from '$components/ui/Input.svelte';
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly, fade } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';

	let email = $state('');
	let submitted = $state(false);
	let loading = $state(false);
	let visible = $state(false);
	$effect(() => { visible = true; });

	function handleSubmit() {
		if (!email.trim()) return;
		loading = true;
		setTimeout(() => {
			loading = false;
			submitted = true;
		}, 800);
	}
</script>

<SEOHead seo={{ title: 'Reset Password — SvelteForge', noindex: true }} />

<div class="auth-page">
	<div class="auth-orb" aria-hidden="true"></div>

	{#if visible}
		<div class="auth-card" in:fly={{ y: 24, duration: 600, easing: expoOut, opacity: 0 }}>
			<div class="auth-brand" in:fade={{ duration: 400, delay: 100 }}>
				<a href="/" class="brand-link">
					<span class="brand-mark">SF</span>
					<span class="brand-name">SvelteForge</span>
				</a>
			</div>

			{#if submitted}
				<div class="success-state" in:fly={{ y: 16, duration: 500, easing: expoOut, opacity: 0 }}>
					<div class="success-icon">
						<Icon icon="ph:envelope-open" size={32} />
					</div>
					<h1 class="auth-title">Check your inbox</h1>
					<p class="auth-subtitle">
						If <strong>{email}</strong> has an account, a password reset link has been sent. Check your spam folder too.
					</p>
					<a href="/login" class="back-link">
						<Icon icon="ph:arrow-left" size={14} />
						Back to login
					</a>
				</div>
			{:else}
				<h1 class="auth-title">Forgot password?</h1>
				<p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>

				<form class="auth-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
					<Input type="email" label="Email address" placeholder="you@example.com" bind:value={email} />
					<Button type="submit" variant="primary" size="md" disabled={loading || !email.trim()}>
						{loading ? 'Sending…' : 'Send Reset Link'}
					</Button>
				</form>

				<p class="auth-footer">
					<a href="/login" class="auth-link">
						<Icon icon="ph:arrow-left" size={13} />
						Back to login
					</a>
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.auth-page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 100dvh;
		padding: var(--sf-space-5);
		background: var(--sf-bg-0);
		overflow: hidden;
	}

	.auth-orb {
		position: absolute;
		inline-size: 600px; block-size: 600px;
		border-radius: 50%;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.09), transparent 65%);
		filter: blur(80px);
		inset-block-start: 50%; inset-inline-start: 50%;
		translate: -50% -50%;
		pointer-events: none;
	}

	.auth-card {
		position: relative;
		z-index: 1;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		padding: var(--sf-space-7);
		inline-size: 100%;
		max-inline-size: 420px;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-5);
		box-shadow: 0 24px 48px oklch(0 0 0 / 0.3);
	}

	.auth-brand { text-align: center; }
	.brand-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		text-decoration: none;
	}
	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 32px; block-size: 32px;
		background: var(--sf-accent);
		color: var(--sf-accent-text);
		border-radius: var(--sf-radius-md);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 800;
	}
	.brand-name {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		color: var(--sf-text-0);
	}

	.auth-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		text-align: center;
	}

	.auth-subtitle {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: calc(-1 * var(--sf-space-3)) 0 0;
		text-align: center;
		line-height: 1.6;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
	}

	.auth-footer {
		text-align: center;
		margin: 0;
	}

	.auth-link, .back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		color: var(--sf-text-2);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		text-decoration: none;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-accent); }
	}

	.success-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-4);
		text-align: center;
	}

	.success-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 64px;
		block-size: 64px;
		border-radius: var(--sf-radius-xl);
		background: var(--sf-accent-subtle);
		color: var(--sf-accent);
		border: 1px solid oklch(0.65 0.25 275 / 0.2);
	}
</style>
