<script lang="ts">
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	let visible = $state(false);
	$effect(() => { visible = true; });

	const sections = [
		{
			title: '1. Acceptance of Terms',
			body: 'By creating an account or using SvelteForge, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms apply to all visitors, users, and subscribers.'
		},
		{
			title: '2. Description of Service',
			body: 'SvelteForge is an interactive learning platform for web development. We provide structured lessons, a browser-based code editor, an AI tutor, and supplementary learning materials for Svelte 5, SvelteKit, TypeScript, HTML, and CSS.'
		},
		{
			title: '3. Account Registration',
			body: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorised use.'
		},
		{
			title: '4. Subscriptions and Billing',
			body: 'Paid features require an active subscription. Monthly subscribers are billed each calendar month. Annual subscribers are billed once per year. Prices are displayed in USD and may be subject to applicable taxes. All charges are non-refundable except where required by law.'
		},
		{
			title: '5. Cancellation',
			body: 'You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You retain full access until that date. No partial refunds are issued for unused time.'
		},
		{
			title: '6. Acceptable Use',
			body: 'You agree not to: (a) scrape, copy, or redistribute platform content; (b) reverse-engineer or attempt to access our systems; (c) share your account credentials; (d) use the platform for any unlawful purpose; or (e) submit harmful code through the code editor.'
		},
		{
			title: '7. Intellectual Property',
			body: 'All lesson content, code examples, UI, and branding on SvelteForge are owned by SvelteForge and protected by copyright. You may use the knowledge you learn but may not republish our lesson content without explicit written permission.'
		},
		{
			title: '8. Disclaimer of Warranties',
			body: 'The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or that the content will meet your specific requirements. Educational content is for learning purposes only.'
		},
		{
			title: '9. Limitation of Liability',
			body: 'To the maximum extent permitted by law, SvelteForge shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid in the 12 months prior to the claim.'
		},
		{
			title: '10. Changes to Terms',
			body: 'We may update these Terms at any time. We will notify active subscribers via email at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance of the updated Terms.'
		},
		{
			title: '11. Governing Law',
			body: 'These Terms are governed by the laws of Ireland, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Dublin, Ireland.'
		},
		{
			title: '12. Contact',
			body: 'If you have questions about these Terms, contact us at legal@svelteforge.dev.'
		}
	];
</script>

<SEOHead seo={{ title: 'Terms of Service — SvelteForge', description: 'SvelteForge Terms of Service. Read our usage policy, subscription terms, and legal information.' }} />

<div class="legal-page">
	{#if visible}
		<div class="legal-inner" in:fly={{ y: 24, duration: 700, easing: expoOut, opacity: 0 }}>
			<div class="legal-header">
				<a href="/" class="legal-back">← SvelteForge</a>
				<h1 class="legal-title">Terms of Service</h1>
				<p class="legal-date">Last updated: 1 April 2026</p>
			</div>

			<div class="legal-body">
				{#each sections as section, i}
					<section class="legal-section" in:fly={{ y: 16, duration: 600, delay: i * 40, easing: expoOut, opacity: 0 }}>
						<h2 class="legal-section-title">{section.title}</h2>
						<p class="legal-section-body">{section.body}</p>
					</section>
				{/each}
			</div>

			<div class="legal-footer">
				<a href="/privacy">Privacy Policy</a>
				<a href="/login">Log In</a>
				<a href="/register">Create Account</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.legal-page {
		min-block-size: 100dvh;
		background: var(--sf-bg-0);
		padding-block: var(--sf-space-8);
		padding-inline: var(--sf-space-5);
		-webkit-font-smoothing: antialiased;
	}

	.legal-inner {
		max-inline-size: 720px;
		margin-inline: auto;
	}

	.legal-header {
		margin-block-end: var(--sf-space-7);
		padding-block-end: var(--sf-space-6);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.legal-back {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		text-decoration: none;
		font-weight: 500;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-accent); }
	}

	.legal-title {
		font-family: var(--sf-font-sans);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		color: var(--sf-text-0);
		margin: var(--sf-space-4) 0 var(--sf-space-2);
		letter-spacing: -0.03em;
	}

	.legal-date {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		margin: 0;
	}

	.legal-body {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
	}

	.legal-section {
		padding-block-end: var(--sf-space-6);
		border-block-end: 1px solid var(--sf-bg-3);

		&:last-child { border-block-end: none; }
	}

	.legal-section-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-3);
		letter-spacing: -0.01em;
	}

	.legal-section-body {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.75;
	}

	.legal-footer {
		display: flex;
		gap: var(--sf-space-5);
		flex-wrap: wrap;
		padding-block-start: var(--sf-space-7);
		margin-block-start: var(--sf-space-6);
		border-block-start: 1px solid var(--sf-bg-3);

		a {
			font-size: var(--sf-font-size-sm);
			color: var(--sf-text-2);
			text-decoration: none;
			font-weight: 500;
			transition: color var(--sf-transition-fast);
			&:hover { color: var(--sf-accent); }
		}
	}
</style>
