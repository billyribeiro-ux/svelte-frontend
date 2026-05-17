import type { Lesson } from '$types/lesson';

export const reactiveBuiltins: Lesson = {
	id: 'svelte-core.advanced.reactive-builtins',
	slug: 'reactive-builtins',
	title: 'Reactive Built-Ins — svelte/reactivity & svelte/reactivity/window',
	description:
		'Leverage SvelteSet, SvelteMap, SvelteDate, SvelteURL, MediaQuery, createSubscriber, and reactive window values for fine-grained reactivity without manual event listeners.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 6,
	estimatedMinutes: 25,
	concepts: [
		'svelte5.reactivity.set',
		'svelte5.reactivity.map',
		'svelte5.reactivity.url',
		'svelte5.reactivity.media-query',
		'svelte5.reactivity.window'
	],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Reactive Built-Ins

Svelte 5 provides reactive implementations of standard JavaScript built-in classes. These behave identically to their native counterparts but trigger reactive updates when read inside effects or templates — no manual event listeners, no wrapper boilerplate.

## Why Built-In Classes Need Reactive Versions

\`$state\` creates deep reactive proxies for plain objects and arrays. But built-in classes like \`Set\`, \`Map\`, \`Date\`, and \`URL\` are **not** plain objects — they use internal slots that JavaScript Proxies cannot intercept. If you wrap a native \`Set\` with \`$state\`, mutations like \`.add()\` and \`.delete()\` will **not** trigger reactive updates.

Svelte solves this with drop-in reactive replacements in \`svelte/reactivity\`.

## SvelteSet and SvelteMap

\`SvelteSet\` and \`SvelteMap\` track all reads and writes reactively:

\`\`\`svelte
<script>
  import { SvelteSet, SvelteMap } from 'svelte/reactivity';

  const tags = new SvelteSet(['svelte', 'kit']);
  const scores = new SvelteMap([['Alice', 10], ['Bob', 20]]);

  let newTag = $state('');
</script>

<p>{tags.size} tags: {[...tags].join(', ')}</p>

<input bind:value={newTag} />
<button onclick={() => { tags.add(newTag); newTag = ''; }}>
  Add Tag
</button>
<button onclick={() => tags.clear()}>Clear All</button>

<h3>Scores</h3>
{#each scores as [name, score]}
  <p>{name}: {score}
    <button onclick={() => scores.set(name, score + 1)}>+1</button>
  </p>
{/each}
\`\`\`

Every method works exactly like the native counterpart — \`.add()\`, \`.delete()\`, \`.has()\`, \`.forEach()\`, iteration, etc. The difference is that reading \`.size\` or iterating in a template or effect registers a reactive dependency, and mutations notify subscribers.

## SvelteDate

\`SvelteDate\` makes dates reactive. Calling any setter (\`setHours\`, \`setFullYear\`, etc.) triggers updates:

\`\`\`svelte
<script>
  import { SvelteDate } from 'svelte/reactivity';

  const now = new SvelteDate();

  $effect(() => {
    const id = setInterval(() => now.setTime(Date.now()), 1000);
    return () => clearInterval(id);
  });
</script>

<p>Time: {now.toLocaleTimeString()}</p>
\`\`\`

## SvelteURL and SvelteURLSearchParams

\`SvelteURL\` makes all URL components reactive — \`pathname\`, \`searchParams\`, \`hash\`, \`hostname\`, etc.:

\`\`\`svelte
<script>
  import { SvelteURL } from 'svelte/reactivity';

  const url = new SvelteURL('https://example.com/path?key=value');
</script>

<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />
<input bind:value={url.href} size="65" />
\`\`\`

Changes to any component automatically update \`url.href\` and vice versa. \`SvelteURLSearchParams\` works the same way for standalone query strings:

\`\`\`svelte
<script>
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  const params = new SvelteURLSearchParams('message=hello');
  let key = $state('key');
  let value = $state('value');
</script>

<input bind:value={key} />
<input bind:value={value} />
<button onclick={() => params.append(key, value)}>append</button>

<p>?{params.toString()}</p>

{#each params as [k, v]}
  <p>{k}: {v}</p>
{/each}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.set'
		},
		{
			type: 'text',
			content: `## MediaQuery — Reactive Media Queries

\`MediaQuery\` provides a reactive wrapper around \`window.matchMedia\`. No event listeners, no cleanup — just a reactive \`.current\` property:

\`\`\`svelte
<script>
  import { MediaQuery } from 'svelte/reactivity';

  const isMobile = new MediaQuery('max-width: 768px');
  const prefersDark = new MediaQuery('prefers-color-scheme: dark');
  const prefersReducedMotion = new MediaQuery('prefers-reduced-motion: reduce');
</script>

{#if isMobile.current}
  <MobileNav />
{:else}
  <DesktopNav />
{/if}

<div class:dark={prefersDark.current}>
  <p>Reduced motion: {prefersReducedMotion.current ? 'yes' : 'no'}</p>
</div>
\`\`\`

\`MediaQuery\` automatically subscribes and unsubscribes via Svelte's reactive system — when the component is destroyed, the listener is cleaned up. On the server, \`.current\` returns the \`fallback\` value (second argument, defaults to \`false\`).

## \`createSubscriber\` — Integrating External Event Sources

\`createSubscriber\` (available since 5.7.0) bridges external event-based systems with Svelte's reactivity. It returns a \`subscribe\` function that, when called in a reactive context, triggers re-evaluation whenever the external source fires:

\`\`\`ts
import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';

export class MediaQuery {
  #query;
  #subscribe;

  constructor(query: string) {
    this.#query = window.matchMedia(\`(\${query})\`);

    this.#subscribe = createSubscriber((update) => {
      const off = on(this.#query, 'change', update);
      return () => off();
    });
  }

  get current() {
    this.#subscribe(); // registers reactive dependency
    return this.#query.matches;
  }
}
\`\`\`

The \`start\` callback receives an \`update\` function. When \`update()\` is called, any effect that read \`.current\` re-runs. The cleanup function runs when all effects are destroyed.

This is the primitive behind \`MediaQuery\` itself, and you can use it to make **any** event source reactive — WebSocket messages, \`IntersectionObserver\` changes, \`BroadcastChannel\` events, etc.`
		},
		{
			type: 'checkpoint',
			content: 'cp-reactive-builtins'
		},
		{
			type: 'text',
			content: `## \`svelte/reactivity/window\` — Reactive Window Values

This module exports reactive versions of common \`window\` properties, each with a \`.current\` property:

\`\`\`svelte
<script>
  import { innerWidth, innerHeight, scrollX, scrollY, online } from 'svelte/reactivity/window';
</script>

<p>Viewport: {innerWidth.current}×{innerHeight.current}</p>
<p>Scroll: ({scrollX.current}, {scrollY.current})</p>
<p>Online: {online.current ? '✅' : '❌'}</p>
\`\`\`

Available exports:
- **\`innerWidth\`**, **\`innerHeight\`** — viewport dimensions
- **\`outerWidth\`**, **\`outerHeight\`** — window dimensions including chrome
- **\`scrollX\`**, **\`scrollY\`** — scroll position
- **\`online\`** — \`navigator.onLine\` status
- **\`screenLeft\`**, **\`screenTop\`** — window position (updated in rAF)
- **\`devicePixelRatio\`** — zoom-responsive on Chrome

All return \`undefined\` on the server — safe for SSR.

### Replacing \`<svelte:window>\` Bindings

Before \`svelte/reactivity/window\`, you had to use:

\`\`\`svelte
<svelte:window bind:innerWidth={w} bind:scrollY={y} />
\`\`\`

Now you can import the reactive values directly — no special elements needed:

\`\`\`svelte
<script>
  import { innerWidth, scrollY } from 'svelte/reactivity/window';
</script>

<p>Width: {innerWidth.current}, Scroll: {scrollY.current}</p>
\`\`\`

This is cleaner, composable (pass the reactive value to a function), and works in \`.svelte.ts\` modules.

### Practical Example: Responsive Layout + Scroll Progress

\`\`\`svelte
<script>
  import { innerWidth, scrollY, innerHeight } from 'svelte/reactivity/window';
  import { MediaQuery } from 'svelte/reactivity';

  const isMobile = new MediaQuery('max-width: 640px');

  // Compute scroll progress (0 to 1)
  const scrollProgress = $derived.by(() => {
    const y = scrollY.current ?? 0;
    const h = innerHeight.current ?? 1;
    const docHeight = typeof document !== 'undefined'
      ? document.documentElement.scrollHeight
      : h;
    return Math.min(y / (docHeight - h), 1);
  });
</script>

<div class="progress-bar" style="width: {scrollProgress * 100}%"></div>

{#if isMobile.current}
  <p>Mobile view — width: {innerWidth.current}px</p>
{:else}
  <p>Desktop view — width: {innerWidth.current}px</p>
{/if}

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: #6366f1;
    z-index: 999;
    transition: width 0.1s;
  }
</style>
\`\`\``
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  // TODO: Create a SvelteSet of tags
  // TODO: Create a MediaQuery for mobile detection
  // TODO: Import scrollY from svelte/reactivity/window

  let newTag = $state('');
</script>

<div>
  <h2>Reactive Built-Ins</h2>

  <section>
    <h3>SvelteSet</h3>
    <input bind:value={newTag} placeholder="New tag" />
    <!-- TODO: Add tag button and display tags -->
  </section>

  <section>
    <h3>Media Query</h3>
    <!-- TODO: Show different text for mobile vs desktop -->
  </section>

  <section>
    <h3>Window Reactivity</h3>
    <!-- TODO: Display scrollY position -->
  </section>
</div>

<style>
  div { font-family: system-ui, sans-serif; padding: 1rem; max-width: 600px; margin: 0 auto; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
  h3 { margin: 0 0 0.75rem; font-size: 0.95rem; color: #6366f1; }
  input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; margin-right: 0.5rem; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .tag { display: inline-block; padding: 0.25rem 0.5rem; margin: 0.25rem; background: #ede9fe; color: #6366f1; border-radius: 4px; font-size: 0.875rem; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { SvelteSet, MediaQuery } from 'svelte/reactivity';
  import { scrollY } from 'svelte/reactivity/window';

  const tags = new SvelteSet(['svelte', 'kit', 'runes']);
  const isMobile = new MediaQuery('max-width: 768px');

  let newTag = $state('');

  function addTag() {
    if (newTag.trim()) {
      tags.add(newTag.trim());
      newTag = '';
    }
  }
</script>

<div>
  <h2>Reactive Built-Ins</h2>

  <section>
    <h3>SvelteSet ({tags.size} tags)</h3>
    <input bind:value={newTag} placeholder="New tag" onkeydown={(e) => e.key === 'Enter' && addTag()} />
    <button onclick={addTag}>Add</button>
    <div style="margin-top: 0.5rem">
      {#each tags as tag}
        <span class="tag">
          {tag}
          <button onclick={() => tags.delete(tag)} style="background:none;color:#6366f1;border:none;cursor:pointer;padding:0 0.25rem;">×</button>
        </span>
      {/each}
    </div>
  </section>

  <section>
    <h3>Media Query</h3>
    <p>{isMobile.current ? '📱 Mobile viewport' : '🖥️ Desktop viewport'}</p>
  </section>

  <section>
    <h3>Window Reactivity</h3>
    <p>Scroll Y: {scrollY.current ?? 0}px</p>
  </section>
</div>

<style>
  div { font-family: system-ui, sans-serif; padding: 1rem; max-width: 600px; margin: 0 auto; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
  h3 { margin: 0 0 0.75rem; font-size: 0.95rem; color: #6366f1; }
  input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; margin-right: 0.5rem; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .tag { display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; margin: 0.25rem; background: #ede9fe; color: #6366f1; border-radius: 4px; font-size: 0.875rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-reactive-builtins',
			description: 'Use SvelteSet and reactive window values to build a reactive UI without manual event listeners',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'SvelteSet' },
						{ type: 'contains', value: 'svelte/reactivity' }
					]
				}
			},
			hints: [
				'Import `SvelteSet` from `svelte/reactivity` and create a new instance.',
				'Use `.add()`, `.delete()`, `.size` just like a native `Set` — they are reactive.',
				'Import `scrollY` from `svelte/reactivity/window` and read `scrollY.current` in the template.'
			],
			conceptsTested: ['svelte5.reactivity.set', 'svelte5.reactivity.window']
		}
	]
};
