<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { preferences } from '$stores/preferences.svelte';
	import { userState } from '$stores/user.svelte';
	import Switch from '$components/ui/Switch.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	function setTheme(theme: 'dark' | 'light') {
		userState.setTheme(theme);
	}

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.toggleAttribute('data-high-contrast', preferences.accessibility.highContrast);
			document.documentElement.toggleAttribute('data-reduced-motion', preferences.accessibility.reducedMotion);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="backdrop"
		role="presentation"
		onclick={onclose}
		onkeydown={handleKeydown}
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="panel"
			role="dialog"
			aria-label="Settings"
			aria-modal="true"
			tabindex="0"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleKeydown}
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			<header class="panel-header">
				<h2>Settings</h2>
				<button class="close-btn" onclick={onclose} aria-label="Close settings">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</button>
			</header>

			<div class="panel-body">
				<section class="settings-section">
					<h3>Appearance</h3>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Theme</span>
							<span class="setting-desc">Choose your color scheme</span>
						</div>
						<div class="theme-toggle">
							<button
								class={["theme-btn", userState.preferences.theme === 'dark' && "active"]}
								onclick={() => setTheme('dark')}
								aria-pressed={userState.preferences.theme === 'dark'}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								Dark
							</button>
							<button
								class={["theme-btn", userState.preferences.theme === 'light' && "active"]}
								onclick={() => setTheme('light')}
								aria-pressed={userState.preferences.theme === 'light'}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
									<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
								</svg>
								Light
							</button>
						</div>
					</div>
				</section>

				<section class="settings-section">
					<h3>Accessibility</h3>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">High contrast</span>
							<span class="setting-desc">Increase contrast for better readability</span>
						</div>
						<Switch checked={preferences.accessibility.highContrast} label="High contrast" />
					</div>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Reduced motion</span>
							<span class="setting-desc">Disable animations and transitions</span>
						</div>
						<Switch checked={preferences.accessibility.reducedMotion} label="Reduced motion" />
					</div>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Announce errors</span>
							<span class="setting-desc">Screen reader announces compilation errors</span>
						</div>
						<Switch checked={preferences.accessibility.announceErrors} label="Announce errors" />
					</div>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Announce console</span>
							<span class="setting-desc">Screen reader announces new console output</span>
						</div>
						<Switch checked={preferences.accessibility.announceConsole} label="Announce console" />
					</div>
				</section>

				<section class="settings-section">
					<h3>Editor</h3>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Font size</span>
							<span class="setting-desc">{preferences.editor.fontSize}px</span>
						</div>
						<div class="size-controls">
							<button
								class="size-btn"
								aria-label="Decrease font size"
								onclick={() => preferences.update('fontSize', Math.max(10, preferences.editor.fontSize - 1))}
							>−</button>
							<span class="size-value">{preferences.editor.fontSize}</span>
							<button
								class="size-btn"
								aria-label="Increase font size"
								onclick={() => preferences.update('fontSize', Math.min(24, preferences.editor.fontSize + 1))}
							>+</button>
						</div>
					</div>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Word wrap</span>
							<span class="setting-desc">Wrap long lines in the editor</span>
						</div>
						<Switch checked={preferences.editor.wordWrap} label="Word wrap" />
					</div>
					<div class="setting-row">
						<div class="setting-info">
							<span class="setting-label">Line numbers</span>
							<span class="setting-desc">Show line numbers in the gutter</span>
						</div>
						<Switch checked={preferences.editor.lineNumbers} label="Line numbers" />
					</div>
				</section>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0 0 0 / 0.6);
		backdrop-filter: blur(4px);
	}

	.panel {
		inline-size: min(480px, 90vw);
		max-block-size: 80vh;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		box-shadow: var(--sf-shadow-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-4) var(--sf-space-5);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.panel-header h2 {
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);

		&:hover {
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
		}
	}

	.panel-body {
		overflow-y: auto;
		padding: var(--sf-space-4) var(--sf-space-5);
	}

	.settings-section {
		margin-block-end: var(--sf-space-5);

		&:last-child {
			margin-block-end: 0;
		}
	}

	.settings-section h3 {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-block-end: var(--sf-space-3);
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-3) 0;
		border-block-end: 1px solid var(--sf-bg-2);

		&:last-child {
			border-block-end: none;
		}
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.setting-label {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-0);
		font-weight: 500;
	}

	.setting-desc {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.theme-toggle {
		display: flex;
		gap: 2px;
		background: var(--sf-bg-2);
		padding: 2px;
		border-radius: var(--sf-radius-md);
	}

	.theme-btn {
		display: flex;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-1) var(--sf-space-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);
		transition: all var(--sf-transition-fast);

		&.active {
			background: var(--sf-bg-1);
			color: var(--sf-text-0);
			box-shadow: var(--sf-shadow-sm);
		}

		&:hover:not(.active) {
			color: var(--sf-text-1);
		}
	}

	.size-controls {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
	}

	.size-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		font-size: var(--sf-font-size-md);
		color: var(--sf-text-1);
		background: var(--sf-bg-3);
		border-radius: var(--sf-radius-sm);
		font-weight: 600;

		&:hover {
			background: var(--sf-accent-subtle);
			color: var(--sf-accent);
		}
	}

	.size-value {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		min-width: 2ch;
		text-align: center;
	}
</style>
