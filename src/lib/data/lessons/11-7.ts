import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-7',
		title: 'Link Options & Preloading',
		phase: 3,
		module: 11,
		lessonIndex: 7
	},
	description: `SvelteKit turns plain <a> tags into smart, preloaded, scroll-aware navigations — configured entirely through data attributes. No special Link component required. Each data-sveltekit-* attribute tunes one aspect of navigation and can be set on the link itself, a wrapping element, or globally on <body> in the root layout.

Preloading is the headline feature: SvelteKit can download a page's code and data as soon as the user hovers, taps, or scrolls a link into view — making the actual click feel instantaneous. Beyond that you can control scroll behavior, history entries, full reloads, and focus management.`,
	objectives: [
		'Use data-sveltekit-preload-data to preload page data on hover/tap/off',
		'Use data-sveltekit-preload-code to preload JS modules on hover/tap/viewport/eager',
		'Understand the difference between preloading code and preloading data',
		'Control scroll behavior with data-sveltekit-noscroll',
		'Replace history entries with data-sveltekit-replacestate',
		'Bypass client-side routing with data-sveltekit-reload',
		'Preserve focus across navigation with data-sveltekit-keepfocus',
		'Apply link options globally via the root layout body element'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // SvelteKit link options are data attributes on <a> tags.
  // They cascade: set once on <body> in the root layout for app-wide defaults,
  // override on a <nav>, override again on an individual <a>.

  interface LinkOption {
    attribute: string;
    values: string;
    description: string;
    when: string;
    example: string;
  }

  const linkOptions: LinkOption[] = [
    {
      attribute: 'data-sveltekit-preload-data',
      values: '"hover" | "tap" | "off" | "false"',
      description: 'Starts the page load() function early so data is ready at click time.',
      when: 'Default for most links. Use "tap" on slow networks (hover burns mobile data).',
      example: \`<a href="/dashboard" data-sveltekit-preload-data="hover">
  Dashboard
</a>\`
    },
    {
      attribute: 'data-sveltekit-preload-code',
      values: '"eager" | "viewport" | "hover" | "tap" | "off" | "false"',
      description: 'Downloads the page JS module (but does NOT run its load function).',
      when: 'Use "viewport" for above-the-fold nav. "eager" only for critical routes — it downloads everything up-front.',
      example: \`<nav data-sveltekit-preload-code="viewport">
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
</nav>\`
    },
    {
      attribute: 'data-sveltekit-noscroll',
      values: '(boolean attribute)',
      description: 'Prevents the automatic scroll-to-top after navigation.',
      when: 'Tab switchers, pagination inside a scrolled list, anchors to the same section.',
      example: \`<a href="/settings/profile" data-sveltekit-noscroll>
  Profile tab
</a>\`
    },
    {
      attribute: 'data-sveltekit-replacestate',
      values: '(boolean attribute)',
      description: 'Replaces the current history entry instead of pushing a new one.',
      when: 'Back button should skip this state — filter changes, tab switches, login redirects.',
      example: \`<a href="?sort=newest" data-sveltekit-replacestate>
  Sort by newest
</a>\`
    },
    {
      attribute: 'data-sveltekit-reload',
      values: '(boolean attribute)',
      description: 'Forces a full browser reload instead of client-side navigation.',
      when: 'External-ish routes: downloads, logout, routes served by another framework.',
      example: \`<a href="/api/download/report.pdf" data-sveltekit-reload>
  Download PDF
</a>\`
    },
    {
      attribute: 'data-sveltekit-keepfocus',
      values: '(boolean attribute)',
      description: 'Keeps the currently focused element focused after navigation.',
      when: 'Type-ahead search: the URL updates but the user stays in the input.',
      example: \`<form data-sveltekit-keepfocus>
  <input name="q" oninput={updateUrl} />
</form>\`
    }
  ];

  let selectedOption: number = $state(0);

  // Simulated preload behavior
  type PreloadMode = 'off' | 'hover' | 'tap' | 'viewport' | 'eager';
  let mode: PreloadMode = $state('hover');
  let logs: string[] = $state([]);

  function push(msg: string) {
    logs = [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...logs].slice(0, 8);
  }

  function handleHover(link: string) {
    if (mode === 'hover') push(\`preload → \${link} (triggered by hover)\`);
  }
  function handleTouchStart(link: string) {
    if (mode === 'tap') push(\`preload → \${link} (triggered by tap)\`);
  }
  function handleClick(link: string, e: MouseEvent) {
    e.preventDefault();
    push(\`navigate → \${link}\`);
  }

  function changeMode(next: PreloadMode) {
    mode = next;
    if (next === 'eager') push('eager: all linked pages preloaded immediately');
    else if (next === 'viewport') push('viewport: preload when link scrolls into view');
    else push(\`mode set to "\${next}"\`);
  }
</script>

<main>
  <h1>Link Options & Preloading</h1>

  <section>
    <h2>Why Link Options Matter</h2>
    <p>
      SvelteKit's preloader is the single biggest contributor to that "this app
      feels native" sensation. By the time a user clicks, the next page's code
      and data are often <em>already in memory</em>. A normal <code>&lt;a&gt;</code>
      tag becomes a guaranteed sub-100ms navigation.
    </p>
    <p class="callout">
      <strong>Global default:</strong> set <code>data-sveltekit-preload-data="hover"</code>
      on <code>&lt;body&gt;</code> in your root layout and you're done — every
      link in your app inherits it.
    </p>
  </section>

  <section>
    <h2>Setting Options Globally</h2>
    <pre>{\`<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();
</script>

<svelte:body data-sveltekit-preload-data="hover" />

<nav data-sveltekit-preload-code="viewport">
  <a href="/">Home</a>
  <a href="/blog">Blog</a>
  <a href="/docs">Docs</a>
</nav>

{@render children()}\`}</pre>
    <p class="callout">
      Options cascade from the nearest ancestor. Setting
      <code>data-sveltekit-preload-data="off"</code> on one link opts that single
      link out of the global default.
    </p>
  </section>

  <section>
    <h2>Preload Data vs Preload Code</h2>
    <table>
      <thead>
        <tr><th></th><th>preload-code</th><th>preload-data</th></tr>
      </thead>
      <tbody>
        <tr><td>Downloads page JS module</td><td>yes</td><td>yes</td></tr>
        <tr><td>Runs load() function</td><td>no</td><td>yes</td></tr>
        <tr><td>Possible values</td><td>eager, viewport, hover, tap, off</td><td>hover, tap, off</td></tr>
        <tr><td>Default</td><td>viewport (fallback from preload-data)</td><td>(none)</td></tr>
      </tbody>
    </table>
    <p class="callout">
      <strong>Relationship:</strong> <code>preload-data</code> implies
      <code>preload-code</code> at the same or earlier stage. Setting
      <code>preload-data="hover"</code> automatically gives you
      <code>preload-code="hover"</code> for free.
    </p>
  </section>

  <section>
    <h2>Interactive Preload Simulator</h2>
    <p>Change the mode, then hover/click the links to see what happens:</p>
    <div class="mode-picker">
      {#each ['off', 'hover', 'tap', 'viewport', 'eager'] as m (m)}
        <button class:active={mode === m} onclick={() => changeMode(m as PreloadMode)}>
          {m}
        </button>
      {/each}
    </div>

    <div class="sim-links">
      {#each ['/dashboard', '/blog', '/settings', '/docs'] as href (href)}
        <a
          {href}
          onmouseenter={() => handleHover(href)}
          ontouchstart={() => handleTouchStart(href)}
          onclick={(e) => handleClick(href, e)}
        >
          {href}
        </a>
      {/each}
    </div>

    <div class="log">
      <h4>Event log</h4>
      {#each logs as entry (entry)}
        <div class="log-entry">{entry}</div>
      {:else}
        <div class="log-empty">Hover or click a link above.</div>
      {/each}
    </div>
  </section>

  <section>
    <h2>All Link Options</h2>
    <div class="options-list">
      {#each linkOptions as option, i (option.attribute)}
        <button
          class="option-btn"
          class:active={selectedOption === i}
          onclick={() => (selectedOption = i)}
        >
          {option.attribute.replace('data-sveltekit-', '')}
        </button>
      {/each}
    </div>

    {#each linkOptions as option, i (option.attribute)}
      {#if selectedOption === i}
        <div class="option-detail">
          <h3><code>{option.attribute}</code></h3>
          <p><strong>Values:</strong> <code>{option.values}</code></p>
          <p>{option.description}</p>
          <p><strong>When to use:</strong> {option.when}</p>
          <pre>{option.example}</pre>
        </div>
      {/if}
    {/each}
  </section>

  <section>
    <h2>Real-World Recipes</h2>

    <h3>Tab navigation (URL-driven, no scroll jump)</h3>
    <pre>{\`<nav class="tabs">
  <a
    href="/settings/profile"
    data-sveltekit-noscroll
    data-sveltekit-replacestate
  >Profile</a>
  <a
    href="/settings/security"
    data-sveltekit-noscroll
    data-sveltekit-replacestate
  >Security</a>
  <a
    href="/settings/billing"
    data-sveltekit-noscroll
    data-sveltekit-replacestate
  >Billing</a>
</nav>\`}</pre>

    <h3>Search as you type</h3>
    <pre>{\`<form
  method="GET"
  action="/search"
  data-sveltekit-keepfocus
  data-sveltekit-replacestate
>
  <input name="q" oninput={(e) => goto(\\\`?q=\${e.currentTarget.value}\\\`, {
    keepFocus: true,
    replaceState: true,
    noScroll: true
  })} />
</form>\`}</pre>

    <h3>File downloads & external routes</h3>
    <pre>{\`<a href="/exports/report.csv" data-sveltekit-reload>
  Download CSV
</a>

<a href="/legacy-admin" data-sveltekit-reload>
  Legacy admin (separate framework)
</a>\`}</pre>

    <h3>Opt a slow route out of preloading</h3>
    <pre>{\`<!-- The rest of the nav preloads on hover, but /huge-report
     runs a beefy load() — wait for the actual click. -->
<nav data-sveltekit-preload-data="hover">
  <a href="/">Home</a>
  <a href="/blog">Blog</a>
  <a href="/huge-report" data-sveltekit-preload-data="off">
    Huge Report (200k rows)
  </a>
</nav>\`}</pre>
  </section>

  <section>
    <h2>Programmatic Equivalents</h2>
    <p>
      Every data attribute has a <code>goto()</code> option counterpart. Use the
      imperative form when navigating from JS.
    </p>
    <pre>{\`import { goto, preloadData, preloadCode } from '$app/navigation';

// Imperatively preload
await preloadCode('/dashboard');        // just the module
await preloadData('/dashboard');        // module + load()

// Equivalents of data attributes
await goto('/settings/profile', {
  replaceState: true,   // data-sveltekit-replacestate
  noScroll: true,       // data-sveltekit-noscroll
  keepFocus: true       // data-sveltekit-keepfocus
});\`}</pre>
  </section>

  <section>
    <h2>Common Pitfalls</h2>
    <ul class="pitfalls">
      <li><strong>Preloading on hover on mobile:</strong> hover events fire on tap. Either accept it or switch to <code>"tap"</code>.</li>
      <li><strong>Expecting <code>reload</code> to work on external domains:</strong> it doesn't — it only affects links within your app.</li>
      <li><strong>Using <code>eager</code> everywhere:</strong> that's your entire app downloaded on first paint. Reserve it for critical routes.</li>
      <li><strong>Forgetting <code>keepFocus</code> on live search:</strong> your input loses focus on every keystroke.</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th, td { padding: 0.4rem 0.6rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  .mode-picker { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
  .mode-picker button { padding: 0.35rem 0.75rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  .mode-picker button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .sim-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem; }
  .sim-links a { padding: 0.5rem 0.9rem; background: #f0f7ff; color: #4a90d9; text-decoration: none; border-radius: 4px; font-family: monospace; font-size: 0.85rem; border: 1px solid #bbdefb; }
  .sim-links a:hover { background: #e3f2fd; }
  .log { background: #111; color: #8df; padding: 0.75rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; min-height: 120px; }
  .log h4 { color: white; margin: 0 0 0.5rem; font-family: sans-serif; }
  .log-entry { padding: 0.1rem 0; }
  .log-empty { color: #666; font-style: italic; }
  .options-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .option-btn { padding: 0.4rem 0.75rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 0.8rem; font-family: monospace; }
  .option-btn.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .option-detail { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
  .pitfalls li { margin: 0.4rem 0; }
  h3 { margin-top: 1rem; font-size: 0.95rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
