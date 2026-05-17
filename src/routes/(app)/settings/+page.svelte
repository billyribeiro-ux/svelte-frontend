<script lang="ts">
	import { userState } from '$stores/user.svelte';
	import { preferences } from '$stores/preferences.svelte';
	import Switch from '$components/ui/Switch.svelte';
	import Input from '$components/ui/Input.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';

	let isDark = $state(userState.preferences.theme === 'dark');
	$effect(() => { userState.setTheme(isDark ? 'dark' : 'light'); });

	let fontSizeStr = $state(String(preferences.editor.fontSize));
	let tabSizeStr = $state(String(preferences.editor.tabSize));
	$effect(() => {
		const parsed = parseInt(fontSizeStr, 10);
		if (!isNaN(parsed) && parsed >= 10 && parsed <= 24) preferences.update('fontSize', parsed);
	});
	$effect(() => {
		const parsed = parseInt(tabSizeStr, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) preferences.update('tabSize', parsed);
	});

	let useVim = $state(preferences.editor.keymap === 'vim');
	$effect(() => { preferences.update('keymap', useVim ? 'vim' : 'default'); });

	// Learning preferences
	let dailyGoal = $state(3);
	let emailDigest = $state(true);
	let achievementAlerts = $state(true);
	let lessonReminders = $state(false);
	let marketingEmails = $state(false);
	let autoSave = $state(true);
	let showLineNumbers = $state(true);
	let wordWrap = $state(false);

	const shortcuts = [
		{ keys: ['⌘', 'K'], description: 'Open command palette' },
		{ keys: ['⌘', 'Enter'], description: 'Run code / check answer' },
		{ keys: ['⌘', 'S'], description: 'Save current file' },
		{ keys: ['⌘', '/'], description: 'Toggle comment' },
		{ keys: ['⌘', 'B'], description: 'Toggle sidebar' },
		{ keys: ['Tab'], description: 'Indent code' },
		{ keys: ['Shift', 'Tab'], description: 'Dedent code' },
		{ keys: ['Esc'], description: 'Close dialog / palette' },
		{ keys: ['⌘', 'Z'], description: 'Undo last change' },
		{ keys: ['⌘', 'Shift', 'Z'], description: 'Redo change' }
	];
</script>

<SEOHead seo={{ title: 'Settings', description: 'Customize your SvelteForge learning experience — theme, editor preferences, and more.' }} />

<div class="settings-page">
	<h1 class="page-title" in:fly={{ y: 20, duration: 600, easing: expoOut, opacity: 0 }}>Settings</h1>

	<!-- Appearance -->
	<section class="settings-section" in:fly={{ y: 20, duration: 600, delay: 60, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Appearance</h2>
		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Dark Mode</span>
				<span class="setting-description">Toggle between dark and light interface theme.</span>
			</div>
			<Switch bind:checked={isDark} label="Dark mode" />
		</div>
	</section>

	<!-- Editor Preferences -->
	<section class="settings-section" in:fly={{ y: 20, duration: 600, delay: 120, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Editor Preferences</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Font Size</span>
				<span class="setting-description">Code editor font size in pixels (10–24).</span>
			</div>
			<div class="setting-input">
				<Input type="text" bind:value={fontSizeStr} />
			</div>
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Tab Size</span>
				<span class="setting-description">Number of spaces per indentation level (1–8).</span>
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

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Line Numbers</span>
				<span class="setting-description">Show line numbers in the code editor gutter.</span>
			</div>
			<Switch bind:checked={showLineNumbers} label="Line numbers" />
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Word Wrap</span>
				<span class="setting-description">Wrap long lines instead of horizontal scrolling.</span>
			</div>
			<Switch bind:checked={wordWrap} label="Word wrap" />
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Auto Save</span>
				<span class="setting-description">Automatically save your code as you type.</span>
			</div>
			<Switch bind:checked={autoSave} label="Auto save" />
		</div>
	</section>

	<!-- Learning Preferences -->
	<section class="settings-section" in:fly={{ y: 20, duration: 600, delay: 180, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Learning Preferences</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Daily Lesson Goal</span>
				<span class="setting-description">How many lessons you aim to complete per day.</span>
			</div>
			<div class="goal-selector">
				{#each [1, 2, 3, 5, 10] as n}
					<button
						class="goal-btn"
						class:goal-btn--active={dailyGoal === n}
						onclick={() => { dailyGoal = n; }}
					>{n}</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Notifications -->
	<section class="settings-section" in:fly={{ y: 20, duration: 600, delay: 240, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Notifications</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Weekly Progress Digest</span>
				<span class="setting-description">A weekly email summary of your learning progress.</span>
			</div>
			<Switch bind:checked={emailDigest} label="Email digest" />
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Achievement Alerts</span>
				<span class="setting-description">Get notified when you earn badges or complete tracks.</span>
			</div>
			<Switch bind:checked={achievementAlerts} label="Achievement alerts" />
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Lesson Reminders</span>
				<span class="setting-description">Daily reminders to keep your learning streak alive.</span>
			</div>
			<Switch bind:checked={lessonReminders} label="Lesson reminders" />
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Product Updates</span>
				<span class="setting-description">Occasional emails about new features and content.</span>
			</div>
			<Switch bind:checked={marketingEmails} label="Product updates" />
		</div>
	</section>

	<!-- Keyboard Shortcuts -->
	<section class="settings-section" in:fly={{ y: 20, duration: 600, delay: 300, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Keyboard Shortcuts</h2>
		<div class="shortcuts-list">
			{#each shortcuts as s}
				<div class="shortcut-row">
					<span class="shortcut-desc">{s.description}</span>
					<div class="shortcut-keys">
						{#each s.keys as key}
							<kbd class="kbd">{key}</kbd>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Account / Danger Zone -->
	<section class="settings-section settings-section--danger" in:fly={{ y: 20, duration: 600, delay: 360, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title section-title--danger">Account</h2>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Export My Data</span>
				<span class="setting-description">Download a copy of all your progress and account data.</span>
			</div>
			<button class="action-btn">
				<Icon icon="ph:download-simple" size={16} />
				Export
			</button>
		</div>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Delete Account</span>
				<span class="setting-description danger-text">Permanently delete your account and all data. This cannot be undone.</span>
			</div>
			<button class="action-btn action-btn--danger">
				<Icon icon="ph:trash" size={16} />
				Delete
			</button>
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

	/* Goal selector */
	.goal-selector {
		display: flex;
		gap: var(--sf-space-2);
		flex-shrink: 0;
	}

	.goal-btn {
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--sf-radius-md);
		border: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-2);
		color: var(--sf-text-2);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--sf-transition-fast);

		&:hover { border-color: var(--sf-accent); color: var(--sf-accent); }

		&.goal-btn--active {
			background: var(--sf-accent);
			border-color: var(--sf-accent);
			color: var(--sf-accent-text);
		}
	}

	/* Keyboard shortcuts */
	.shortcuts-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sf-space-4);
		padding-block: var(--sf-space-2);
		border-block-end: 1px solid var(--sf-bg-3);

		&:last-child { border-block-end: none; }
	}

	.shortcut-desc {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
	}

	.shortcut-keys {
		display: flex;
		gap: var(--sf-space-1);
		flex-shrink: 0;
	}

	.kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px 6px;
		background: var(--sf-bg-3);
		border: 1px solid var(--sf-bg-4);
		border-block-end-width: 2px;
		border-radius: var(--sf-radius-sm);
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-1);
		white-space: nowrap;
	}

	/* Action buttons */
	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-2) var(--sf-space-4);
		border-radius: var(--sf-radius-md);
		border: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-2);
		color: var(--sf-text-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		cursor: pointer;
		flex-shrink: 0;
		transition: all var(--sf-transition-fast);
		&:hover { border-color: var(--sf-accent); color: var(--sf-accent); }

		&.action-btn--danger {
			color: var(--sf-error);
			border-color: oklch(0.65 0.22 25 / 0.3);
			&:hover { background: oklch(0.65 0.22 25 / 0.1); border-color: var(--sf-error); }
		}
	}

	/* Danger section */
	.settings-section--danger {
		border-color: oklch(0.65 0.22 25 / 0.2);
	}

	.section-title--danger {
		color: var(--sf-error);
	}

	.danger-text {
		color: var(--sf-error) !important;
		opacity: 0.8;
	}
</style>
