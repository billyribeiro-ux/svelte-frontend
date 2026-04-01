<script lang="ts">
	import { userState } from '$stores/user.svelte';
	import { preferences } from '$stores/preferences.svelte';
	import Switch from '$components/ui/Switch.svelte';
	import Input from '$components/ui/Input.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';

	let isDark = $state(userState.preferences.theme === 'dark');

	$effect(() => {
		userState.setTheme(isDark ? 'dark' : 'light');
	});

	let fontSizeStr = $state(String(preferences.editor.fontSize));
	let tabSizeStr = $state(String(preferences.editor.tabSize));

	$effect(() => {
		const parsed = parseInt(fontSizeStr, 10);
		if (!isNaN(parsed) && parsed >= 10 && parsed <= 24) {
			preferences.update('fontSize', parsed);
		}
	});

	$effect(() => {
		const parsed = parseInt(tabSizeStr, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
			preferences.update('tabSize', parsed);
		}
	});

	let useVim = $state(preferences.editor.keymap === 'vim');

	$effect(() => {
		preferences.update('keymap', useVim ? 'vim' : 'default');
	});
</script>

<SEOHead seo={{ title: 'Settings', description: 'Customize your SvelteForge learning experience — theme, editor preferences, and more.' }} />

<div class="settings-page">
	<h1 class="page-title">Settings</h1>

	<section class="settings-section">
		<h2 class="section-title">Appearance</h2>
		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Dark Mode</span>
				<span class="setting-description">Toggle between dark and light theme.</span>
			</div>
			<Switch bind:checked={isDark} label="Dark mode" />
		</div>
	</section>

	<section class="settings-section">
		<h2 class="section-title">Editor Preferences</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Font Size</span>
				<span class="setting-description">Editor font size in pixels (10-24).</span>
			</div>
			<div class="setting-input">
				<Input type="text" bind:value={fontSizeStr} />
			</div>
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Tab Size</span>
				<span class="setting-description">Number of spaces per indentation level (1-8).</span>
			</div>
			<div class="setting-input">
				<Input type="text" bind:value={tabSizeStr} />
			</div>
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Vim Keybindings</span>
				<span class="setting-description">Use Vim-style keyboard shortcuts in the editor.</span>
			</div>
			<Switch bind:checked={useVim} label="Vim mode" />
		</div>
	</section>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
		max-inline-size: 640px;
	}

	.page-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
	}

	.section-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
		padding-block-end: var(--sf-space-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sf-space-4);
		padding-block: var(--sf-space-2);
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
		flex: 1;
	}

	.setting-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-0);
	}

	.setting-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.setting-input {
		inline-size: 80px;
		flex-shrink: 0;
	}
</style>
