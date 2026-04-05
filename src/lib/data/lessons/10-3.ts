import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-3',
		title: 'Context: Sharing Without Props',
		phase: 3,
		module: 10,
		lessonIndex: 3
	},
	description: `When components are deeply nested, passing data through every intermediate level via props becomes tedious — this is called "prop drilling." Svelte's Context API solves this by allowing an ancestor component to provide a value that any descendant can read directly.

As of Svelte 5.40, the preferred API is createContext<T>() which returns a type-safe [get, set] pair. The older setContext/getContext still works but requires manual type annotations. Use createContext whenever you can — you get type safety automatically, and it prevents accidental state leakage between users during server-side rendering.`,
	objectives: [
		'Use createContext<T>() to create type-safe context pairs',
		'Provide context from a parent and consume it in any descendant',
		'Understand the prop drilling problem that context solves',
		'Know when to use context vs props vs shared module state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import ThemeProvider from './ThemeProvider.svelte';
  import DeepChild from './DeepChild.svelte';
</script>

<main>
  <h1>Context: Sharing Without Props</h1>

  <section>
    <h2>The Prop Drilling Problem</h2>
    <pre>{\`<!-- Without context: pass "theme" through every level -->
<GrandParent theme={theme}>     <!-- knows about theme -->
  <Parent theme={theme}>         <!-- just passing through! -->
    <Child theme={theme}>        <!-- just passing through! -->
      <DeepChild {theme} />      <!-- actually uses theme -->
    </Child>
  </Parent>
</GrandParent>\`}</pre>
  </section>

  <section>
    <h2>Live Demo with createContext</h2>
    <ThemeProvider>
      <div class="nested">
        <p>Wrapper (doesn't know about theme)</p>
        <div class="nested">
          <p>Deeply nested wrapper</p>
          <div class="nested">
            <DeepChild />
          </div>
        </div>
      </div>
    </ThemeProvider>
  </section>

  <section>
    <h2>When to Use What</h2>
    <ul>
      <li><strong>Props</strong> — direct parent-child communication</li>
      <li><strong>Context</strong> — shared config across a subtree (theme, locale, auth)</li>
      <li><strong>Classes with $state fields</strong> — shared reactive state across unrelated components</li>
    </ul>
    <p class="note">
      Avoid shared module-level state for data that should be scoped per-request —
      during SSR it can leak between users. Context is scoped to a component tree
      instance, so it's safe.
    </p>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .nested { margin-left: 1rem; padding: 0.5rem; border-left: 3px solid #6690ff; margin-top: 0.5rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  ul { padding-left: 1.25rem; }
  li { margin: 0.25rem 0; }
  .note { margin-top: 0.75rem; padding: 0.6rem; background: #fff7ed; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
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
