<script lang="ts">
	import { goto } from '$app/navigation';
	import Input from '$components/ui/Input.svelte';
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly, fade } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let visible = $state(false);
	$effect(() => { visible = true; });

	function handleLogin() {
		loading = true;
		setTimeout(() => goto('/dashboard'), 600);
	}
</script>

<SEOHead seo={{ title: 'Log In — SvelteForge', description: 'Log in to your SvelteForge account to continue learning.', noindex: true }} />

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

			<h1 class="auth-title">Welcome back</h1>
			<p class="auth-subtitle">Log in to continue your learning journey.</p>

			<div class="social-btns">
				<button class="social-btn" type="button">
					<Icon icon="ph:github-logo" size={18} />
					Continue with GitHub
				</button>
				<button class="social-btn" type="button">
					<Icon icon="ph:google-logo" size={18} />
					Continue with Google
				</button>
			</div>

			<div class="auth-divider">
				<span>or continue with email</span>
			</div>

			<form class="auth-form" onsubmit={e => { e.preventDefault(); handleLogin(); }}>
				<Input type="email" label="Email" placeholder="you@example.com" bind:value={email} />
				<Input type="password" label="Password" placeholder="Your password" bind:value={password} />
				<a href="/forgot-password" class="forgot-link">Forgot password?</a>
				<Button type="submit" variant="primary" size="md" disabled={loading}>
					{loading ? 'Logging in…' : 'Log In'}
				</Button>
			</form>

			<p class="auth-footer">
				Don't have an account? <a href="/register" class="auth-link">Create one free</a>
			</p>
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
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.1), transparent 65%);
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
	}

	.social-btns {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
	}

	.social-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--sf-space-2);
		inline-size: 100%;
		padding: var(--sf-space-3) var(--sf-space-4);
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-md);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-0);
		cursor: pointer;
		transition: all var(--sf-transition-fast);
		&:hover { border-color: var(--sf-accent); background: var(--sf-bg-3); }
	}

	.auth-divider {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		color: var(--sf-text-3);
		font-size: var(--sf-font-size-xs);

		&::before, &::after {
			content: '';
			flex: 1;
			block-size: 1px;
			background: var(--sf-bg-3);
		}
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
	}

	.forgot-link {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		text-decoration: none;
		text-align: end;
		margin-block-start: calc(-1 * var(--sf-space-2));
		&:hover { color: var(--sf-accent); }
	}

	.auth-footer {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		text-align: center;
		margin: 0;
	}

	.auth-link {
		color: var(--sf-accent);
		text-decoration: none;
		font-weight: 500;
		&:hover { text-decoration: underline; }
	}
</style>
