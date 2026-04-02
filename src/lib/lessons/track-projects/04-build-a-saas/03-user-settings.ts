import type { Lesson } from '$types/lesson';

export const userSettings: Lesson = {
	id: 'projects.build-a-saas.user-settings',
	slug: 'user-settings',
	title: 'User Settings',
	description:
		'Build a tabbed settings page with profile editing, theme preferences, notification controls, and a danger zone — all backed by reactive stores.',
	trackId: 'projects',
	moduleId: 'build-a-saas',
	order: 3,
	estimatedMinutes: 25,
	concepts: ['svelte5.runes.state', 'svelte5.bindings.input', 'svelte5.runes.effect'],
	prerequisites: ['projects.build-a-saas.api-layer'],

	content: [
		{
			type: 'text',
			content: `# Building User Settings

Every SaaS application needs a settings page. Users expect to update their profile, configure notification preferences, choose a theme, and manage their account. In this lesson you will build a comprehensive, tabbed settings page that demonstrates form handling at scale, persistent user preferences, and the "dirty form" pattern that warns users about unsaved changes.

## The Settings Data Model

Our settings are grouped into three categories, each mapped to a tab:

\`\`\`ts
interface ProfileSettings {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  compactMode: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}
\`\`\`

Each category is a \`$state\` object in a settings store. Separating them means changes to notification preferences do not trigger reactivity in the profile section — fine-grained updates that matter in larger forms.

## The Settings Store

The settings store manages current values, original values (for dirty checking), and save/reset operations:

\`\`\`ts
function createSettingsStore() {
  let profile = $state<ProfileSettings>({
    name: 'Jane Developer',
    email: 'jane@example.com',
    bio: 'Full-stack developer who loves Svelte.',
    avatar: 'JD',
  });

  let preferences = $state<PreferenceSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    compactMode: false,
  });

  let notifications = $state<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  let savedProfile = $state({ ...profile });
  let savedPreferences = $state({ ...preferences });
  let savedNotifications = $state({ ...notifications });

  return {
    get profile() { return profile; },
    get preferences() { return preferences; },
    get notifications() { return notifications; },

    updateProfile(updates: Partial<ProfileSettings>) {
      Object.assign(profile, updates);
    },

    updatePreferences(updates: Partial<PreferenceSettings>) {
      Object.assign(preferences, updates);
    },

    updateNotifications(updates: Partial<NotificationSettings>) {
      Object.assign(notifications, updates);
    },

    async saveProfile() {
      await new Promise(r => setTimeout(r, 500));
      savedProfile = $state.snapshot(profile);
    },

    async savePreferences() {
      await new Promise(r => setTimeout(r, 500));
      savedPreferences = $state.snapshot(preferences);
    },

    resetProfile() {
      Object.assign(profile, savedProfile);
    },

    get isProfileDirty() {
      return JSON.stringify($state.snapshot(profile)) !== JSON.stringify(savedProfile);
    },

    get isPreferencesDirty() {
      return JSON.stringify($state.snapshot(preferences)) !== JSON.stringify(savedPreferences);
    },
  };
}
\`\`\`

The "dirty" check compares the current state snapshot against the last saved snapshot using JSON serialization. While not the most efficient approach for large objects, it is simple and reliable for settings forms. When \`isProfileDirty\` is true, we show a "Save" button; when false, the button is hidden or disabled.

## Tabbed Navigation

The settings page uses tabs to switch between sections. We track the active tab with \`$state\`:

\`\`\`ts
let activeTab = $state<'profile' | 'preferences' | 'notifications'>('profile');
\`\`\`

Render tabs as buttons with conditional active styling:

\`\`\`svelte
<div class="tabs">
  {#each ['profile', 'preferences', 'notifications'] as tab}
    <button
      class:active={activeTab === tab}
      onclick={() => activeTab = tab}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  {/each}
</div>
\`\`\`

Below the tabs, conditionally render the corresponding form section with \`{#if}\`.

## The Profile Form

The profile form uses two-way binding for text inputs:

\`\`\`svelte
<label>
  Display Name
  <input bind:value={settingsStore.profile.name} />
</label>

<label>
  Email
  <input type="email" bind:value={settingsStore.profile.email} />
</label>

<label>
  Bio
  <textarea bind:value={settingsStore.profile.bio} rows="3"></textarea>
</label>
\`\`\`

Because \`profile\` is a \`$state\` object with deep reactivity, binding directly to its properties works seamlessly. Each keystroke updates the state, the dirty check recalculates, and the Save button appears.

## Theme Preferences with $effect

When the user changes the theme preference, we apply it to the document immediately using \`$effect\`:

\`\`\`ts
$effect(() => {
  const theme = settingsStore.preferences.theme;
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
});
\`\`\`

This effect runs whenever \`theme\` changes. The DOM update is immediate — the user sees the theme switch without saving. If they navigate away without saving, the preference reverts on next load (because we only persist on explicit save). This is a deliberate UX choice: preview changes instantly, commit them explicitly.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.bindings.input'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Settings Page

Open the starter code. You will find \`settings-store.ts\`, \`SettingsPage.svelte\`, \`ProfileTab.svelte\`, \`PreferencesTab.svelte\`, and \`NotificationsTab.svelte\`.

1. Complete \`settings-store.ts\` with \`$state\` for profile, preferences, and notifications, plus dirty checking and save/reset methods.
2. Build \`SettingsPage.svelte\` with tab navigation and conditional tab rendering.
3. Complete the tab components with bound form fields and Save/Reset buttons that respect dirty state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-settings-store'
		},
		{
			type: 'text',
			content: `## Notification Toggles

The notifications tab uses checkboxes rather than text inputs. Svelte's \`bind:checked\` directive works with boolean \`$state\`:

\`\`\`svelte
<label class="toggle">
  <input type="checkbox" bind:checked={settingsStore.notifications.emailNotifications} />
  <span>Email Notifications</span>
  <small>Receive notifications about account activity via email.</small>
</label>
\`\`\`

Style these as toggle switches for a modern SaaS feel. The reactive binding means each toggle immediately updates the store — no submit button needed for toggles, since the intent is clear from the interaction.

## The Danger Zone

Every settings page has a "Danger Zone" — destructive actions like deleting the account or exporting all data. Visually separate this section with a red border and clear warnings:

\`\`\`svelte
<section class="danger-zone">
  <h3>Danger Zone</h3>
  <p>These actions are irreversible. Please be certain.</p>
  <button class="danger-btn" onclick={handleDeleteAccount}>
    Delete Account
  </button>
</section>
\`\`\`

Protect the delete with a confirmation dialog — the user must type their email to confirm. This pattern is used by GitHub, Vercel, and most SaaS platforms because it prevents catastrophic accidents while keeping the action accessible when genuinely needed.

## Unsaved Changes Warning

When the user tries to navigate away from a tab with unsaved changes, show a warning. We track this with the dirty state:

\`\`\`ts
function switchTab(newTab: string) {
  if (settingsStore.isProfileDirty && activeTab === 'profile') {
    if (!confirm('You have unsaved changes. Discard them?')) return;
    settingsStore.resetProfile();
  }
  activeTab = newTab;
}
\`\`\`

This is a simplified version of the "beforeunload" guard that browsers provide. For our in-app navigation, a confirm dialog works well. In a SvelteKit application you would hook into the router's navigation guards for the full-page version.`
		},
		{
			type: 'checkpoint',
			content: 'cp-settings-tabs'
		},
		{
			type: 'checkpoint',
			content: 'cp-settings-dirty'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import SettingsPage from './SettingsPage.svelte';
</script>

<div class="app">
  <SettingsPage />
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
</style>`
		},
		{
			name: 'settings-store.ts',
			path: '/settings-store.ts',
			language: 'typescript',
			content: `// TODO: Define ProfileSettings, PreferenceSettings, NotificationSettings interfaces
// TODO: Create settings store with $state for each section
// TODO: Add dirty checking with $state.snapshot comparison
// TODO: Add save, reset, and update methods
`
		},
		{
			name: 'SettingsPage.svelte',
			path: '/SettingsPage.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import settings store and tab components
  // TODO: Add $state for activeTab
</script>

<!-- TODO: Tab navigation -->
<!-- TODO: Conditional tab rendering -->

<style>
  /* Add settings page styles */
</style>`
		},
		{
			name: 'ProfileTab.svelte',
			path: '/ProfileTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import settings store
  // TODO: Add save handler with loading state
</script>

<!-- TODO: Profile form with bound inputs -->

<style>
  /* Add form styles */
</style>`
		},
		{
			name: 'PreferencesTab.svelte',
			path: '/PreferencesTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import settings store
  // TODO: Add $effect for live theme preview
</script>

<!-- TODO: Theme selector, language, timezone, compact mode -->

<style>
  /* Add form styles */
</style>`
		},
		{
			name: 'NotificationsTab.svelte',
			path: '/NotificationsTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import settings store
</script>

<!-- TODO: Notification toggles with bind:checked -->

<style>
  /* Add toggle styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'settings-store.ts',
			path: '/settings-store.ts',
			language: 'typescript',
			content: `export interface ProfileSettings {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  compactMode: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

function createSettingsStore() {
  let profile = $state<ProfileSettings>({
    name: 'Jane Developer',
    email: 'jane@example.com',
    bio: 'Full-stack developer who loves Svelte.',
    avatar: 'JD',
  });

  let preferences = $state<PreferenceSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    compactMode: false,
  });

  let notifications = $state<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  let savedProfile = $state<ProfileSettings>({ ...profile });
  let savedPreferences = $state<PreferenceSettings>({ ...preferences });

  return {
    get profile() { return profile; },
    get preferences() { return preferences; },
    get notifications() { return notifications; },

    updateProfile(updates: Partial<ProfileSettings>) { Object.assign(profile, updates); },
    updatePreferences(updates: Partial<PreferenceSettings>) { Object.assign(preferences, updates); },
    updateNotifications(updates: Partial<NotificationSettings>) { Object.assign(notifications, updates); },

    async saveProfile() {
      await new Promise(r => setTimeout(r, 500));
      savedProfile = $state.snapshot(profile);
    },

    async savePreferences() {
      await new Promise(r => setTimeout(r, 500));
      savedPreferences = $state.snapshot(preferences);
    },

    resetProfile() { Object.assign(profile, savedProfile); },
    resetPreferences() { Object.assign(preferences, savedPreferences); },

    get isProfileDirty() {
      return JSON.stringify($state.snapshot(profile)) !== JSON.stringify(savedProfile);
    },

    get isPreferencesDirty() {
      return JSON.stringify($state.snapshot(preferences)) !== JSON.stringify(savedPreferences);
    },
  };
}

export const settingsStore = createSettingsStore();
`
		},
		{
			name: 'SettingsPage.svelte',
			path: '/SettingsPage.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import ProfileTab from './ProfileTab.svelte';
  import PreferencesTab from './PreferencesTab.svelte';
  import NotificationsTab from './NotificationsTab.svelte';
  import { settingsStore } from './settings-store';

  let activeTab = $state<'profile' | 'preferences' | 'notifications'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'preferences' as const, label: 'Preferences' },
    { id: 'notifications' as const, label: 'Notifications' },
  ];
</script>

<div class="settings">
  <h1>Settings</h1>

  <div class="tabs">
    {#each tabs as tab}
      <button
        class:active={activeTab === tab.id}
        onclick={() => activeTab = tab.id}
      >
        {tab.label}
        {#if tab.id === 'profile' && settingsStore.isProfileDirty}
          <span class="dot"></span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#if activeTab === 'profile'}
      <ProfileTab />
    {:else if activeTab === 'preferences'}
      <PreferencesTab />
    {:else}
      <NotificationsTab />
    {/if}
  </div>
</div>

<style>
  .settings { max-width: 600px; }
  h1 { margin-bottom: 1.5rem; }
  .tabs { display: flex; gap: 0.25rem; border-bottom: 2px solid #e2e8f0; margin-bottom: 1.5rem; }
  .tabs button {
    padding: 0.625rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: #64748b;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    position: relative;
  }
  .tabs button.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: 600; }
  .dot {
    position: absolute;
    top: 8px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: #f59e0b;
    border-radius: 50%;
  }
</style>`
		},
		{
			name: 'ProfileTab.svelte',
			path: '/ProfileTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { settingsStore } from './settings-store';

  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await settingsStore.saveProfile();
    saving = false;
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
  <label>
    Display Name
    <input bind:value={settingsStore.profile.name} />
  </label>

  <label>
    Email
    <input type="email" bind:value={settingsStore.profile.email} />
  </label>

  <label>
    Bio
    <textarea bind:value={settingsStore.profile.bio} rows="3"></textarea>
  </label>

  {#if settingsStore.isProfileDirty}
    <div class="actions">
      <button type="submit" class="save" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      <button type="button" class="reset" onclick={() => settingsStore.resetProfile()}>
        Discard
      </button>
    </div>
  {/if}
</form>

<style>
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-weight: 600; font-size: 0.85rem; color: #374151; }
  input, textarea { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 0.9rem; }
  .actions { display: flex; gap: 0.5rem; }
  .save { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .save:disabled { opacity: 0.5; }
  .reset { padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
</style>`
		},
		{
			name: 'PreferencesTab.svelte',
			path: '/PreferencesTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { settingsStore } from './settings-store';

  $effect(() => {
    const theme = settingsStore.preferences.theme;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  });

  let saving = $state(false);

  async function handleSave() {
    saving = true;
    await settingsStore.savePreferences();
    saving = false;
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
  <label>
    Theme
    <select bind:value={settingsStore.preferences.theme}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>

  <label>
    Language
    <select bind:value={settingsStore.preferences.language}>
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
      <option value="de">German</option>
    </select>
  </label>

  <label>
    Timezone
    <select bind:value={settingsStore.preferences.timezone}>
      <option value="UTC">UTC</option>
      <option value="America/New_York">Eastern Time</option>
      <option value="America/Los_Angeles">Pacific Time</option>
      <option value="Europe/London">London</option>
    </select>
  </label>

  <label class="toggle">
    <input type="checkbox" bind:checked={settingsStore.preferences.compactMode} />
    <span>Compact Mode</span>
  </label>

  {#if settingsStore.isPreferencesDirty}
    <div class="actions">
      <button type="submit" class="save" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      <button type="button" class="reset" onclick={() => settingsStore.resetPreferences()}>
        Discard
      </button>
    </div>
  {/if}
</form>

<style>
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-weight: 600; font-size: 0.85rem; color: #374151; }
  select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
  .toggle { flex-direction: row; align-items: center; gap: 0.5rem; }
  .toggle input { width: auto; }
  .actions { display: flex; gap: 0.5rem; }
  .save { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .save:disabled { opacity: 0.5; }
  .reset { padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
</style>`
		},
		{
			name: 'NotificationsTab.svelte',
			path: '/NotificationsTab.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { settingsStore } from './settings-store';
</script>

<div class="notifications">
  <label class="toggle-item">
    <div class="toggle-info">
      <span class="toggle-label">Email Notifications</span>
      <small>Receive notifications about account activity via email.</small>
    </div>
    <input type="checkbox" bind:checked={settingsStore.notifications.emailNotifications} />
  </label>

  <label class="toggle-item">
    <div class="toggle-info">
      <span class="toggle-label">Push Notifications</span>
      <small>Receive browser push notifications for important updates.</small>
    </div>
    <input type="checkbox" bind:checked={settingsStore.notifications.pushNotifications} />
  </label>

  <label class="toggle-item">
    <div class="toggle-info">
      <span class="toggle-label">Weekly Digest</span>
      <small>Get a weekly summary of your activity and team updates.</small>
    </div>
    <input type="checkbox" bind:checked={settingsStore.notifications.weeklyDigest} />
  </label>

  <label class="toggle-item">
    <div class="toggle-info">
      <span class="toggle-label">Marketing Emails</span>
      <small>Receive product updates, tips, and promotional offers.</small>
    </div>
    <input type="checkbox" bind:checked={settingsStore.notifications.marketingEmails} />
  </label>
</div>

<style>
  .notifications { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
  }
  .toggle-item:hover { background: #f8fafc; }
  .toggle-info { display: flex; flex-direction: column; gap: 0.1rem; }
  .toggle-label { font-weight: 600; font-size: 0.9rem; color: #1e293b; }
  small { color: #64748b; font-size: 0.8rem; }
  input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import SettingsPage from './SettingsPage.svelte';
</script>

<div class="app">
  <SettingsPage />
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-settings-store',
			description: 'Create settings store with $state for profile, preferences, and notifications',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'ProfileSettings' },
						{ type: 'contains', value: 'PreferenceSettings' }
					]
				}
			},
			hints: [
				'Define interfaces for ProfileSettings, PreferenceSettings, and NotificationSettings.',
				'Create `$state` objects for each section inside a factory function.',
				'Export the store with getters for each section and update methods that use `Object.assign()`.'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-settings-tabs',
			description: 'Build tabbed navigation with conditional rendering of tab content',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'activeTab' },
						{ type: 'contains', value: 'class:active' },
						{ type: 'contains', value: '#if activeTab' }
					]
				}
			},
			hints: [
				'Create `let activeTab = $state(\'profile\')` and render tab buttons with `class:active={activeTab === tab}`.',
				'Use `{#if activeTab === \'profile\'}...{:else if activeTab === \'preferences\'}...{:else}...{/if}` to show the active tab.',
				'Each tab button sets `activeTab` on click: `onclick={() => activeTab = tab.id}`.'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-settings-dirty',
			description: 'Implement dirty checking with $state.snapshot and show Save/Discard when dirty',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state.snapshot' },
						{ type: 'contains', value: 'isDirty' },
						{ type: 'contains', value: 'reset' }
					]
				}
			},
			hints: [
				'Store the last saved state: `let savedProfile = $state({ ...profile })`. Update it on save.',
				'Compare with: `get isProfileDirty() { return JSON.stringify($state.snapshot(profile)) !== JSON.stringify(savedProfile); }`.',
				'Show Save/Discard buttons only when dirty: `{#if settingsStore.isProfileDirty}...{/if}` and implement reset by `Object.assign(profile, savedProfile)`.'
			],
			conceptsTested: ['svelte5.state.snapshots', 'svelte5.runes.state']
		}
	]
};
