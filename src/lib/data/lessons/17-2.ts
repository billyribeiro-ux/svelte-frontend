import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-2',
		title: '$app/navigation & Lifecycle',
		phase: 5,
		module: 17,
		lessonIndex: 2
	},
	description: `SvelteKit provides navigation functions and lifecycle hooks through $app/navigation that give you fine-grained control over client-side routing. The goto() function navigates programmatically, invalidate() re-runs load functions for specific data, and invalidateAll() refreshes all page data.

Navigation lifecycle hooks — beforeNavigate, afterNavigate, and onNavigate — let you intercept and respond to navigation events. Use them to show loading indicators, prevent navigation with unsaved changes, animate page transitions, or track analytics events.`,
	objectives: [
		'Navigate programmatically with goto() and its options',
		'Re-run load functions selectively with invalidate() and invalidateAll()',
		'Intercept navigation with beforeNavigate for unsaved changes protection',
		'Use afterNavigate and onNavigate for analytics and transitions'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating $app/navigation APIs
  // In real SvelteKit, you'd import from '$app/navigation'

  interface NavigationEvent {
    from: string;
    to: string;
    type: 'link' | 'goto' | 'popstate';
    timestamp: string;
    prevented: boolean;
  }

  let currentPath: string = $state('/');
  let hasUnsavedChanges: boolean = $state(false);
  let formData: string = $state('');
  let navigationLog: NavigationEvent[] = $state([]);
  let isNavigating: boolean = $state(false);
  let preventNavigation: boolean = $state(false);
  let lastInvalidation: string | null = $state(null);

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/settings', label: 'Settings' },
    { path: '/profile', label: 'Profile' },
  ];

  // Simulate goto()
  async function goto(path: string, opts?: { replaceState?: boolean; invalidateAll?: boolean }): Promise<void> {
    const event: NavigationEvent = {
      from: currentPath,
      to: path,
      type: 'goto',
      timestamp: new Date().toLocaleTimeString(),
      prevented: false,
    };

    // beforeNavigate check
    if (preventNavigation && hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Leave anyway?');
      if (!confirmed) {
        event.prevented = true;
        navigationLog = [event, ...navigationLog].slice(0, 8);
        return;
      }
    }

    isNavigating = true;
    navigationLog = [event, ...navigationLog].slice(0, 8);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    currentPath = path;
    isNavigating = false;

    if (opts?.invalidateAll) {
      lastInvalidation = \`invalidateAll() at \${new Date().toLocaleTimeString()}\`;
    }
  }

  // Simulate invalidate()
  async function invalidate(dep: string): Promise<void> {
    lastInvalidation = \`invalidate('\${dep}') at \${new Date().toLocaleTimeString()}\`;
  }

  // Track form changes for unsaved changes detection
  $effect(() => {
    hasUnsavedChanges = formData.length > 0;
  });
</script>

<h1>Navigation & Lifecycle</h1>

{#if isNavigating}
  <div class="nav-progress">
    <div class="nav-bar"></div>
  </div>
{/if}

<nav class="route-nav">
  {#each routes as route}
    <button
      class:active={currentPath === route.path}
      onclick={() => goto(route.path)}
    >
      {route.label}
    </button>
  {/each}
</nav>

<p class="current">Current: <code>{currentPath}</code></p>

<section>
  <h2>goto() — Programmatic Navigation</h2>
  <div class="controls">
    <button onclick={() => goto('/dashboard')}>goto('/dashboard')</button>
    <button onclick={() => goto('/settings', { replaceState: true })}>goto('/settings', &#123; replaceState &#125;)</button>
    <button onclick={() => goto('/', { invalidateAll: true })}>goto('/', &#123; invalidateAll &#125;)</button>
  </div>
</section>

<section>
  <h2>beforeNavigate — Unsaved Changes Guard</h2>
  <label>
    <input type="checkbox" bind:checked={preventNavigation} />
    Enable navigation guard
  </label>
  <div class="form-demo">
    <input
      bind:value={formData}
      placeholder="Type something (creates unsaved changes)..."
    />
    <span class:warn={hasUnsavedChanges}>
      {hasUnsavedChanges ? 'Unsaved changes!' : 'No changes'}
    </span>
  </div>
  <pre class="code"><code>beforeNavigate((navigation) => &#123;
  if (hasUnsavedChanges) &#123;
    if (!confirm('Discard changes?')) &#123;
      navigation.cancel();
    &#125;
  &#125;
&#125;);</code></pre>
</section>

<section>
  <h2>invalidate() & invalidateAll()</h2>
  <div class="controls">
    <button onclick={() => invalidate('app:user')}>invalidate('app:user')</button>
    <button onclick={() => invalidate('app:posts')}>invalidate('app:posts')</button>
    <button onclick={() => { lastInvalidation = \`invalidateAll() at \${new Date().toLocaleTimeString()}\`; }}>
      invalidateAll()
    </button>
  </div>
  {#if lastInvalidation}
    <p class="invalidation">{lastInvalidation}</p>
  {/if}
</section>

<section>
  <h2>Navigation Log</h2>
  {#if navigationLog.length === 0}
    <p class="empty">Navigate to see the log.</p>
  {:else}
    <div class="log">
      {#each navigationLog as event}
        <div class="log-entry" class:prevented={event.prevented}>
          <span class="log-time">{event.timestamp}</span>
          <span class="log-type">{event.type}</span>
          <span class="log-path">{event.from} &rarr; {event.to}</span>
          {#if event.prevented}
            <span class="log-prevented">PREVENTED</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>

<section class="api-ref">
  <h2>API Quick Reference</h2>
  <pre><code>import &#123;
  goto,           // Navigate programmatically
  invalidate,     // Re-run specific load functions
  invalidateAll,  // Re-run all load functions
  beforeNavigate, // Intercept before navigation
  afterNavigate,  // Run after navigation completes
  onNavigate,     // Run during navigation (for transitions)
&#125; from '$app/navigation';</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  .nav-progress {
    position: fixed; top: 0; left: 0; right: 0; height: 3px;
    background: #dfe6e9; z-index: 100;
  }
  .nav-bar {
    height: 100%; width: 60%; background: #6c5ce7;
    animation: progress 0.3s ease-out forwards;
  }
  @keyframes progress { from { width: 0; } to { width: 100%; } }
  .route-nav { display: flex; gap: 2px; margin-bottom: 0.5rem; }
  .route-nav button {
    flex: 1; padding: 0.6rem; border: none; background: #dfe6e9;
    cursor: pointer; font-weight: 600; border-radius: 4px;
  }
  .route-nav button.active { background: #6c5ce7; color: white; }
  .current { font-size: 0.9rem; color: #636e72; }
  .current code { background: #2d3436; color: #74b9ff; padding: 0.2rem 0.5rem; border-radius: 3px; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.05rem; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
    font-size: 0.85rem;
  }
  .form-demo { display: flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0; }
  .form-demo input {
    flex: 1; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px;
  }
  .warn { color: #d63031; font-weight: 600; font-size: 0.85rem; }
  .invalidation {
    font-family: monospace; font-size: 0.85rem; color: #00b894;
    background: #e8f8f0; padding: 0.4rem 0.6rem; border-radius: 4px;
    margin-top: 0.5rem;
  }
  .log { display: flex; flex-direction: column; gap: 0.25rem; }
  .log-entry {
    display: flex; gap: 0.5rem; align-items: center; padding: 0.3rem 0.5rem;
    background: white; border-radius: 4px; font-size: 0.85rem;
  }
  .log-entry.prevented { background: #fff5f5; }
  .log-time { color: #b2bec3; font-family: monospace; font-size: 0.8rem; }
  .log-type {
    padding: 0.1rem 0.4rem; background: #6c5ce7; color: white;
    border-radius: 3px; font-size: 0.75rem;
  }
  .log-path { font-family: monospace; }
  .log-prevented { color: #d63031; font-weight: 700; font-size: 0.8rem; }
  .empty { color: #b2bec3; }
  .api-ref { background: #2d3436; color: #dfe6e9; }
  .api-ref h2 { color: #74b9ff; }
  .code, pre { margin: 0; background: #2d3436; padding: 0.75rem; border-radius: 6px; overflow-x: auto; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
