<script lang="ts">
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	let visible = $state(false);
	$effect(() => { visible = true; });

	const sections = [
		{
			title: '1. Who We Are',
			body: 'SvelteForge is an interactive Svelte learning platform. References to "we", "us", or "our" in this policy refer to SvelteForge. Our contact email is privacy@svelteforge.dev.'
		},
		{
			title: '2. Information We Collect',
			body: 'We collect: (a) Account data — name, email address, authentication provider when you register; (b) Usage data — lessons started/completed, code submissions, time spent, checkpoint results; (c) Technical data — IP address, browser type, device type, referring URLs; (d) Communication data — messages sent to the AI tutor and support team.'
		},
		{
			title: '3. How We Use Your Information',
			body: 'We use your information to: provide and improve the learning platform; personalise your learning path; operate the AI tutor; send transactional emails (receipts, password resets); send optional product updates (you may unsubscribe at any time); comply with legal obligations; and prevent fraud or abuse.'
		},
		{
			title: '4. Data Retention',
			body: 'Account and learning progress data is retained for as long as your account is active. If you delete your account, we permanently delete your personal data within 30 days, except where we are required to retain it for legal or financial compliance reasons.'
		},
		{
			title: '5. Sharing of Information',
			body: 'We do not sell your personal data. We share it only with: (a) service providers who help us operate the platform (e.g. payment processors, email providers, cloud hosting); (b) law enforcement when legally required; (c) a successor entity in the event of a merger or acquisition. All sub-processors are bound by data processing agreements.'
		},
		{
			title: '6. Cookies',
			body: 'We use strictly necessary cookies for session management and authentication. We do not use advertising or third-party tracking cookies. You can manage cookies in your browser settings, though disabling session cookies will prevent you from logging in.'
		},
		{
			title: '7. Security',
			body: 'We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, and access controls. However, no system is perfectly secure and we cannot guarantee absolute security.'
		},
		{
			title: '8. Your Rights',
			body: 'Depending on your location, you may have the right to: access the personal data we hold about you; correct inaccurate data; delete your account and data; export your data in a portable format; object to certain processing; and withdraw consent at any time. Email privacy@svelteforge.dev to exercise these rights.'
		},
		{
			title: '9. Children',
			body: 'SvelteForge is not intended for users under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.'
		},
		{
			title: '10. Changes to This Policy',
			body: 'We may update this Privacy Policy periodically. We will notify you of material changes via email before they take effect. Your continued use of the platform after the effective date constitutes acceptance of the updated policy.'
		},
		{
			title: '11. Contact',
			body: 'For privacy-related enquiries, contact us at privacy@svelteforge.dev. For EU/EEA users, you also have the right to lodge a complaint with your local data protection authority.'
		}
	];
</script>

<SEOHead seo={{ title: 'Privacy Policy — SvelteForge', description: 'How SvelteForge collects, uses, and protects your personal data.' }} />

<div class="legal-page">
	{#if visible}
		<div class="legal-inner" in:fly={{ y: 24, duration: 700, easing: expoOut, opacity: 0 }}>
			<div class="legal-header">
				<a href="/" class="legal-back">← SvelteForge</a>
				<h1 class="legal-title">Privacy Policy</h1>
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
				<a href="/terms">Terms of Service</a>
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
	.legal-inner { max-inline-size: 720px; margin-inline: auto; }
	.legal-header {
		margin-block-end: var(--sf-space-7);
		padding-block-end: var(--sf-space-6);
		border-block-end: 1px solid var(--sf-bg-3);
	}
	.legal-back {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2); text-decoration: none; font-weight: 500;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-accent); }
	}
	.legal-title {
		font-family: var(--sf-font-sans);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800; color: var(--sf-text-0);
		margin: var(--sf-space-4) 0 var(--sf-space-2);
		letter-spacing: -0.03em;
	}
	.legal-date { font-size: var(--sf-font-size-sm); color: var(--sf-text-3); margin: 0; }
	.legal-body { display: flex; flex-direction: column; gap: var(--sf-space-6); }
	.legal-section {
		padding-block-end: var(--sf-space-6);
		border-block-end: 1px solid var(--sf-bg-3);
		&:last-child { border-block-end: none; }
	}
	.legal-section-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg); font-weight: 700;
		color: var(--sf-text-0); margin: 0 0 var(--sf-space-3);
		letter-spacing: -0.01em;
	}
	.legal-section-body {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2); margin: 0; line-height: 1.75;
	}
	.legal-footer {
		display: flex; gap: var(--sf-space-5); flex-wrap: wrap;
		padding-block-start: var(--sf-space-7);
		margin-block-start: var(--sf-space-6);
		border-block-start: 1px solid var(--sf-bg-3);
		a {
			font-size: var(--sf-font-size-sm); color: var(--sf-text-2);
			text-decoration: none; font-weight: 500;
			transition: color var(--sf-transition-fast);
			&:hover { color: var(--sf-accent); }
		}
	}
</style>
