import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-10',
		title: 'Legacy Awareness',
		phase: 5,
		module: 15,
		lessonIndex: 10
	},
	description: `Svelte 5 is a major evolution from Svelte 4, replacing several core patterns with runes and modern APIs. Understanding the legacy patterns is essential for reading existing codebases, migrating projects, and understanding why the new approach is better.

This lesson provides a side-by-side comparison of every important change called out in the official Best Practices guide: onMount becomes $effect, writable/readable stores become $state/$derived or classes with $state fields, slots become snippets, on:event becomes native event properties, use:action becomes {@attach}, class:directive becomes a clsx-style class array, <svelte:component> becomes a dynamic import, and <svelte:self> becomes a plain import.`,
	objectives: [
		'Map legacy onMount/onDestroy patterns to $effect equivalents',
		'Understand how stores ($: reactive declarations) map to $state and $derived',
		'Convert slot-based patterns to Svelte 5 snippet syntax',
		'Replace on:event directives with modern onclick handler properties',
		'Migrate use:action → {@attach}, class:directive → class array, svelte:component/svelte:self → imports'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let activeTab: 'lifecycle' | 'state' | 'slots' | 'events' | 'modern' = $state('lifecycle');

  // All examples below use Svelte 5 syntax, with comments showing Svelte 4 equivalents
  let count: number = $state(0);
  let mounted: boolean = $state(false);
  let timer: number = $state(0);
  let intervalId: ReturnType<typeof setInterval> | null = $state(null);

  // Svelte 5: $effect replaces onMount + onDestroy
  $effect(() => {
    mounted = true;
    intervalId = setInterval(() => { timer++; }, 1000);

    return () => {
      // Cleanup replaces onDestroy
      if (intervalId) clearInterval(intervalId);
    };
  });

  // Svelte 5: $derived replaces $: reactive declarations
  let doubled = $derived(count * 2);
  let quadrupled = $derived(doubled * 2);
  let label = $derived(count === 1 ? 'click' : 'clicks');
</script>

<h1>Legacy vs Modern Svelte</h1>

<nav class="tabs">
  {#each ['lifecycle', 'state', 'slots', 'events', 'modern'] as tab (tab)}
    <button
      class:active={activeTab === tab}
      onclick={() => activeTab = tab as typeof activeTab}
    >
      {tab}
    </button>
  {/each}
</nav>

{#if activeTab === 'lifecycle'}
  <div class="comparison">
    <div class="old">
      <h2>Svelte 4 (Legacy)</h2>
      <pre><code>&lt;script&gt;
  import &#123; onMount, onDestroy &#125; from 'svelte';

  let mounted = false;
  let timer = 0;
  let id;

  onMount(() =&gt; &#123;
    mounted = true;
    id = setInterval(() =&gt; &#123;
      timer++;
    &#125;, 1000);
  &#125;);

  onDestroy(() =&gt; &#123;
    clearInterval(id);
  &#125;);
&lt;/script&gt;</code></pre>
    </div>
    <div class="new">
      <h2>Svelte 5 (Modern)</h2>
      <pre><code>&lt;script lang="ts"&gt;
  let mounted = $state(false);
  let timer = $state(0);

  $effect(() =&gt; &#123;
    mounted = true;
    const id = setInterval(() =&gt; &#123;
      timer++;
    &#125;, 1000);

    return () =&gt; clearInterval(id);
    // cleanup = onDestroy
  &#125;);
&lt;/script&gt;</code></pre>
    </div>
  </div>
  <div class="live">
    <p>Mounted: {mounted} | Timer: {timer}s</p>
  </div>

{:else if activeTab === 'state'}
  <div class="comparison">
    <div class="old">
      <h2>Svelte 4 (Legacy)</h2>
      <pre><code>&lt;script&gt;
  // Mutable variable
  let count = 0;

  // Reactive declaration
  $: doubled = count * 2;
  $: quadrupled = doubled * 2;
  $: label = count === 1 ? 'click' : 'clicks';

  // Stores
  import &#123; writable &#125; from 'svelte/store';
  const name = writable('world');
  // Use: $name in template
&lt;/script&gt;</code></pre>
    </div>
    <div class="new">
      <h2>Svelte 5 (Modern)</h2>
      <pre><code>&lt;script lang="ts"&gt;
  // Reactive state
  let count = $state(0);

  // Derived values
  let doubled = $derived(count * 2);
  let quadrupled = $derived(doubled * 2);
  let label = $derived(
    count === 1 ? 'click' : 'clicks'
  );

  // No stores needed — $state works
  let name = $state('world');
&lt;/script&gt;</code></pre>
    </div>
  </div>
  <div class="live">
    <button onclick={() => count++}>Count: {count}</button>
    <p>Doubled: {doubled} | Quadrupled: {quadrupled} | {label}</p>
  </div>

{:else if activeTab === 'slots'}
  <div class="comparison">
    <div class="old">
      <h2>Svelte 4 (Legacy)</h2>
      <pre><code>&lt;!-- Card.svelte --&gt;
&lt;div class="card"&gt;
  &lt;slot name="header"&gt;
    Default header
  &lt;/slot&gt;
  &lt;slot&gt;Default content&lt;/slot&gt;
  &lt;slot name="footer" /&gt;
&lt;/div&gt;

&lt;!-- Usage --&gt;
&lt;Card&gt;
  &lt;h2 slot="header"&gt;Title&lt;/h2&gt;
  &lt;p&gt;Body content&lt;/p&gt;
&lt;/Card&gt;</code></pre>
    </div>
    <div class="new">
      <h2>Svelte 5 (Modern)</h2>
      <pre><code>&lt;!-- Card.svelte --&gt;
&lt;script lang="ts"&gt;
  import type &#123; Snippet &#125; from 'svelte';
  let &#123; header, children, footer &#125;:
    &#123; header?: Snippet;
      children: Snippet;
      footer?: Snippet; &#125; = $props();
&lt;/script&gt;

&lt;div class="card"&gt;
  &#123;@render header?.()&#125;
  &#123;@render children()&#125;
  &#123;@render footer?.()&#125;
&lt;/div&gt;</code></pre>
    </div>
  </div>
  <div class="live">
    <p>Snippets are type-safe and compose like functions!</p>
  </div>

{:else if activeTab === 'events'}
  <div class="comparison">
    <div class="old">
      <h2>Svelte 4 (Legacy)</h2>
      <pre><code>&lt;!-- on:event directive --&gt;
&lt;button on:click=&#123;handler&#125;&gt;
  Click
&lt;/button&gt;

&lt;input on:input=&#123;handler&#125; /&gt;

&lt;!-- Event forwarding --&gt;
&lt;button on:click&gt;Forward&lt;/button&gt;

&lt;!-- Modifiers --&gt;
&lt;form on:submit|preventDefault=
  &#123;handler&#125;&gt;
&lt;/form&gt;</code></pre>
    </div>
    <div class="new">
      <h2>Svelte 5 (Modern)</h2>
      <pre><code>&lt;!-- Native event properties --&gt;
&lt;button onclick=&#123;handler&#125;&gt;
  Click
&lt;/button&gt;

&lt;input oninput=&#123;handler&#125; /&gt;

&lt;!-- Pass as props --&gt;
&lt;button &#123;onclick&#125;&gt;Forward&lt;/button&gt;

&lt;!-- Handle inline --&gt;
&lt;form onsubmit=&#123;(e) =&gt; &#123;
  e.preventDefault();
  handler(e);
&#125;&#125;&gt;
&lt;/form&gt;</code></pre>
    </div>
  </div>
  <div class="live">
    <button onclick={() => count++}>Svelte 5 onclick — {count} {label}</button>
  </div>

{:else if activeTab === 'modern'}
  <p class="intro">
    The remaining migrations from the official Best Practices guide. Each line
    on the left is legacy Svelte 4; the right side is the April 2026 recommendation.
  </p>
  <div class="comparison">
    <div class="old">
      <h2>Svelte 4 (Legacy)</h2>
      <pre><code>&lt;!-- use:action directive --&gt;
&lt;div use:tooltip=&#123;text&#125;&gt;&lt;/div&gt;

&lt;!-- class:directive --&gt;
&lt;button
  class:active=&#123;isActive&#125;
  class:large=&#123;size === 'lg'&#125;&gt;

&lt;!-- Dynamic component --&gt;
&lt;svelte:component this=&#123;Current&#125; /&gt;

&lt;!-- Recursive component --&gt;
&lt;svelte:self depth=&#123;n - 1&#125; /&gt;

&lt;!-- Shared state via store --&gt;
import &#123; writable &#125; from 'svelte/store';
export const cart = writable([]);

&lt;!-- Effect with browser guard --&gt;
import &#123; browser &#125; from '$app/environment';
$effect(() =&gt; &#123;
  if (browser) &#123;
    localStorage.setItem('x', value);
  &#125;
&#125;);</code></pre>
    </div>
    <div class="new">
      <h2>Svelte 5 (Modern)</h2>
      <pre><code>&lt;!-- &#123;@attach&#125; — reactive, effect-based --&gt;
&lt;div &#123;@attach tooltip(text)&#125;&gt;&lt;/div&gt;

&lt;!-- class={'{'}[...{'}'}] — clsx-style array --&gt;
&lt;button class=&#123;[
  isActive &amp;&amp; 'active',
  size === 'lg' &amp;&amp; 'large'
]&#125;&gt;

&lt;!-- Dynamic component — just use it --&gt;
&lt;Current /&gt;

&lt;!-- Recursive — import yourself --&gt;
import Self from './FileTree.svelte';
&lt;Self depth=&#123;n - 1&#125; /&gt;

&lt;!-- Class with $state field --&gt;
class Cart &#123;
  items = $state([]);
&#125;
export const cart = new Cart();

&lt;!-- Effects never run on server --&gt;
$effect(() =&gt; &#123;
  localStorage.setItem('x', value);
  // no browser guard needed!
&#125;);</code></pre>
    </div>
  </div>
  <div class="live">
    <p>
      These changes eliminate wrapper APIs, remove duplicate syntax, and delete
      the most common "why is this broken?" traps — browser guards and prop drilling.
    </p>
  </div>
{/if}

<style>
  h1 { color: #2d3436; }
  .tabs { display: flex; gap: 0; border-bottom: 2px solid #dfe6e9; margin-bottom: 1.5rem; }
  .tabs button {
    padding: 0.6rem 1.2rem; border: none; background: transparent;
    cursor: pointer; font-weight: 600; color: #636e72;
    border-bottom: 3px solid transparent; text-transform: capitalize;
  }
  .tabs button.active { color: #6c5ce7; border-bottom-color: #6c5ce7; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .old, .new {
    padding: 1rem; border-radius: 8px; overflow: auto;
  }
  .old { background: #fff5f5; border: 1px solid #ff7675; }
  .new { background: #f0fff4; border: 1px solid #00b894; }
  .old h2 { color: #d63031; font-size: 1rem; margin-top: 0; }
  .new h2 { color: #00b894; font-size: 1rem; margin-top: 0; }
  pre { margin: 0; overflow-x: auto; }
  code { font-size: 0.8rem; line-height: 1.5; }
  .live {
    margin-top: 1rem; padding: 1rem; background: #f8f9fa;
    border-radius: 8px; border: 1px solid #dfe6e9;
  }
  .live button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  .intro { font-size: 0.85rem; color: #636e72; margin-bottom: 0.75rem; font-style: italic; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
