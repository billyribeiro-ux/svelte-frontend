import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-3',
		title: 'Context: Sharing Without Props',
		phase: 3,
		module: 10,
		lessonIndex: 3
	},
	description: `When a value needs to reach a component three or four levels down — a theme, the current user, an i18n locale, a notification bus — threading it through every intermediate component is exhausting and leaks implementation details. Svelte's **Context API** solves this by letting an ancestor provide a value that any descendant can read directly, without touching the components in between.

As of Svelte 5.40, the preferred API is \`createContext<T>()\`, which returns a type-safe \`[get, set]\` pair:

\`\`\`ts
import { createContext } from 'svelte';
export const [getTheme, setTheme] = createContext<ThemeStore>();
\`\`\`

The provider component calls \`setTheme(value)\` during its setup; any descendant calls \`getTheme()\` to read it. TypeScript knows the shape automatically. The older \`setContext(key, value)\` / \`getContext(key)\` API still works — useful when you need the key for introspection or for legacy code — but \`createContext\` is strictly better for new code: no key typos, no manual type annotations, no accidental collisions.

**When to use what?** Use **props** for direct parent→child data. Use **context** for anything scoped to a subtree: theme, auth, locale, route info, a notification bus, a form-context shared by compound components. Use **classes with \`$state\` in a \`.svelte.ts\` module** for app-wide shared state — but only when the data genuinely is shared across users (feature flags, cached lookups), never for per-request or per-user state, since SSR shares modules between requests and context does not.

This lesson demonstrates the classic theme example (provider + deep child), shows how context can hold *functions and reactive objects* not just static values, explains nested contexts (inner providers shadow outer ones JavaScript-scope style), and compares \`createContext\` with the legacy key-based API.`,
	objectives: [
		'Use createContext<T>() to create type-safe context pairs',
		'Provide context from a parent via setter and consume it in any descendant via getter',
		'Store functions and reactive $state objects in context, not just static values',
		'Understand that inner context providers shadow outer ones (nested contexts)',
		'Know the difference between props, context, and shared module state',
		'Recognise the legacy setContext/getContext API and know why createContext is preferred',
		'Understand why context is safe during SSR and module-level state generally is not'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import ThemeProvider from './ThemeProvider.svelte';
  import DeepChild from './DeepChild.svelte';
  import { createContext } from 'svelte';

  // ============================================================
  // Extra demonstration: a nested context using createContext
  // to share a "notification bus" — just a function plus a log.
  // ============================================================

  type Notifier = {
    notify: (msg: string) => void;
    messages: string[];
  };

  const [getNotifier, setNotifier] = createContext<Notifier>();

  // The "provider" lives inline here for brevity.
  const notifier: Notifier = $state({
    notify(msg: string) {
      this.messages = [...this.messages, msg];
    },
    messages: []
  });
  setNotifier(notifier);
</script>

<main>
  <h1>Context: Sharing Without Props</h1>

  <section>
    <h2>The Prop Drilling Problem</h2>
    <p>
      Without context, sharing a value across many levels
      means every intermediate component has to accept it
      and pass it on — even the ones that don't care about it.
    </p>
    <pre>{'<!-- Without context: pass "theme" through every level -->\\n<GrandParent theme={theme}>\\n  <Parent theme={theme}>\\n    <Child theme={theme}>\\n      <DeepChild {theme} />  <!-- actually uses it -->\\n    </Child>\\n  </Parent>\\n</GrandParent>'}</pre>
  </section>

  <section>
    <h2>Live demo with <code>createContext</code></h2>
    <p>
      <code>createContext&lt;T&gt;()</code> (added in Svelte
      5.40) returns a typed <code>[get, set]</code> pair.
      The <code>ThemeProvider</code> component below sets
      the value; <code>DeepChild</code> reads it three levels
      deep — no props in between.
    </p>
    <ThemeProvider>
      <div class="nested">
        <p>Wrapper level 1 (doesn't know about theme)</p>
        <div class="nested">
          <p>Wrapper level 2 (also oblivious)</p>
          <div class="nested">
            <DeepChild />
          </div>
        </div>
      </div>
    </ThemeProvider>
  </section>

  <section>
    <h2>Context can hold anything — including functions</h2>
    <p>
      Most real context values are <em>not</em> plain data.
      They're little objects exposing getters and methods,
      giving descendants a safe API to observe and mutate
      shared state. Here's a notification bus set via
      <code>setNotifier</code> and consumed by the buttons
      below.
    </p>
    <div class="notify-row">
      <button onclick={() => notifier.notify('Hello at ' + new Date().toLocaleTimeString())}>
        Push a message
      </button>
      <button onclick={() => (notifier.messages = [])}>Clear</button>
    </div>
    <ul class="messages">
      {#each notifier.messages as msg, i (i + msg)}
        <li>{msg}</li>
      {:else}
        <li class="empty">No messages yet.</li>
      {/each}
    </ul>
    <p class="hint">
      In a real app, <code>setNotifier</code> would live in a
      <code>NotificationProvider</code> component near the
      root, and any descendant would call
      <code>getNotifier()?.notify(...)</code>.
    </p>
  </section>

  <section>
    <h2>Props vs context vs module state</h2>
    <ul>
      <li>
        <strong>Props</strong> — direct parent→child. Use for
        anything the immediate parent owns or controls. Explicit,
        type-safe, and the cheapest to reason about.
      </li>
      <li>
        <strong>Context</strong> — shared config across a subtree
        (theme, auth, locale, notifications, route info). Scoped
        to a component instance tree, so safe during SSR.
      </li>
      <li>
        <strong>Classes with <code>$state</code> fields</strong> —
        shared reactive state across unrelated components. The
        next lesson covers the <code>.svelte.ts</code> module
        pattern for this.
      </li>
    </ul>
    <p class="note">
      <strong>When NOT to use module-level state:</strong>
      data scoped to a single user/request. During SSR a
      module is shared across every request, so writing
      user-specific state to it leaks data between users.
      Context is always instance-scoped and always safe.
    </p>
  </section>

  <section>
    <h2>Nested contexts</h2>
    <p>
      Contexts are keyed by the identity of the
      <code>createContext</code> call, not by name, so you can
      provide the <em>same</em> context twice at different
      levels — nearer providers "shadow" outer ones for their
      descendants, JavaScript-scope style.
    </p>
    <pre>{'<Theme value="light">\\n  <Header />        <!-- sees light -->\\n  <Theme value="dark">\\n    <Sidebar />     <!-- sees dark -->\\n  </Theme>\\n  <Footer />        <!-- sees light again -->\\n</Theme>'}</pre>
  </section>

  <section>
    <h2>Legacy API: <code>setContext</code> / <code>getContext</code></h2>
    <p>
      Before 5.40, context was keyed by a symbol you managed
      yourself. It still works (see <code>legacy-context.ts</code>
      in this lesson) but it's strictly worse: no type inference,
      manual error messages, and easy to typo the key.
    </p>
    <p><code>createContext</code> should be your default.</p>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  section { margin-top: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
  h1 { margin-top: 0; }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  .nested { margin-left: 1rem; padding: 0.5rem; border-left: 3px solid #6690ff; margin-top: 0.5rem; }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    white-space: pre;
  }
  ul { padding-left: 1.25rem; }
  li { margin: 0.3rem 0; }
  .note {
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    background: #fff7ed;
    border-left: 3px solid #f59e0b;
    border-radius: 3px;
    font-size: 0.85rem;
    color: #78350f;
  }
  .hint {
    margin-top: 0.5rem;
    font-size: 0.78rem;
    color: #6b7280;
  }
  .notify-row { display: flex; gap: 0.5rem; margin: 0.5rem 0; }
  button {
    padding: 0.45rem 0.9rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .messages {
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    list-style: none;
    font-size: 0.85rem;
  }
  .messages li { padding: 0.2rem 0; border-bottom: 1px dashed #e5e7eb; }
  .messages li:last-child { border-bottom: none; }
  .messages li.empty { color: #9ca3af; font-style: italic; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'theme-context.ts',
			content: `import { createContext } from 'svelte';

export interface ThemeStore {
  current: 'light' | 'dark';
  toggle: () => void;
}

// createContext returns a [get, set] pair.
// Added in Svelte 5.40 — the preferred API over setContext/getContext.
// Type safety is automatic: getTheme() returns ThemeStore | undefined.
export const [getTheme, setTheme] = createContext<ThemeStore>();
`,
			language: 'typescript'
		},
		{
			filename: 'ThemeProvider.svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setTheme, type ThemeStore } from './theme-context';

  let { children }: { children: Snippet } = $props();

  let current: 'light' | 'dark' = $state('light');

  // Provide a reactive getter + setter via an object with $state-backed access.
  const store: ThemeStore = {
    get current() { return current; },
    toggle() { current = current === 'light' ? 'dark' : 'light'; }
  };

  setTheme(store);
</script>

<div class="provider" data-theme={current}>
  <button onclick={store.toggle}>
    Toggle Theme (current: {current})
  </button>
  {@render children()}
</div>

<style>
  .provider {
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s;
  }
  .provider[data-theme="light"] { background: #fafafa; color: #222; }
  .provider[data-theme="dark"] { background: #1a1a2e; color: #eee; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-bottom: 1rem; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'DeepChild.svelte',
			content: `<script lang="ts">
  import { getTheme } from './theme-context';

  // No props needed — the theme comes from context.
  // getTheme() is fully typed: hover it in your editor to see ThemeStore.
  const theme = getTheme();
</script>

{#if theme}
  <div class="child">
    <p>
      I'm a deeply nested child. My theme is
      <strong>{theme.current}</strong> — no prop drilling!
    </p>
  </div>
{:else}
  <p>No theme context provided.</p>
{/if}

<style>
  .child { padding: 0.5rem; background: rgba(102, 144, 255, 0.1); border-radius: 4px; }
  strong { color: #6690ff; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'legacy-context.ts',
			content: `// Fallback: setContext + getContext (pre-5.40 or when you need a key)
// createContext is preferred — it gives you type safety for free.
import { setContext, getContext } from 'svelte';

const THEME_KEY = Symbol('theme');

interface Theme {
  current: 'light' | 'dark';
  toggle: () => void;
}

export function provideTheme(value: Theme): void {
  setContext(THEME_KEY, value);
}

export function useTheme(): Theme {
  const value = getContext<Theme>(THEME_KEY);
  if (!value) throw new Error('useTheme() called outside a theme provider');
  return value;
}
`,
			language: 'typescript'
		}
	]
};

export default lesson;
