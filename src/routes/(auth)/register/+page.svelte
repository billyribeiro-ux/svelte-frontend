<script lang="ts">
	import { goto } from '$app/navigation';
	import Input from '$components/ui/Input.svelte';
	import Button from '$components/ui/Button.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');

	function handleRegister() {
		// Phase 1 stub — redirect to dashboard
		goto('/dashboard');
	}
</script>

<SEOHead seo={{ title: 'Create Account', description: 'Create a SvelteForge account to start your interactive Svelte 5 learning journey.', noindex: true }} />

<div class="auth-page">
	<div class="auth-card">
		<h1 class="auth-title">Create Account</h1>
		<form class="auth-form" onsubmit={e => { e.preventDefault(); handleRegister(); }}>
			<Input
				type="text"
				label="Name"
				placeholder="Your name"
				bind:value={name}
			/>
			<Input
				type="email"
				label="Email"
				placeholder="you@example.com"
				bind:value={email}
			/>
			<Input
				type="password"
				label="Password"
				placeholder="Choose a password"
				bind:value={password}
			/>
			<Button type="submit" variant="primary" size="md">Register</Button>
		</form>
		<p class="auth-footer">
			Already have an account? <a href="/login" class="auth-link">Login</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 100dvh;
		padding: var(--sf-space-5);
	}

	.auth-card {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-7);
		inline-size: 100%;
		max-inline-size: 400px;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-5);
	}

	.auth-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		text-align: center;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
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

		&:hover {
			text-decoration: underline;
		}
	}
</style>
